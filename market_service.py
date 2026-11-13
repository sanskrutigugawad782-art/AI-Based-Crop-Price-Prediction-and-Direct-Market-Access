"""Karnataka crop market + yield service.

Layered data source:
  1. LIVE  — free keyless Ministry-sourced mandi price API (data.gov.in via
             mandi-api). Fetched state-wide per crop, cached in the SQLite DB.
  2. CACHE — fresh snapshots within a TTL (no rate-limit hammering).
  3. MODEL — deterministic per-crop × district estimates (seasonality, region
             offsets) used when live is unavailable/offline or crop is
             vegetables/fruits not in the feed.

Everything degrades gracefully: the API never blocks on the network.
"""
import datetime as _dt
import json
import math
import random
import sqlite3
import threading
import time
import urllib.parse
import urllib.request

LIVE_BASE = "https://mandi-api.onrender.com/v1"
LIVE_STATE = "Karnataka"
PRICE_UNIT = "₹/quintal"
SNAPSHOT_TTL_S = 6 * 3600           # serve cached live rows within this window
RETRY_COOLDOWN_S = 15 * 60          # wait at least this before retrying a failed crop
REQUEST_TIMEOUT = 15

# ---------------------------------------------------------------------------
# Crop universe  (key -> crop)
# ---------------------------------------------------------------------------
# base = typical modal ₹/quintal for Karnataka; season = monthly (Jan..Dec)
# multipliers; yieldQ = baseline qty (quintals/acre) for the yield model.
_C = lambda cat, live, base, monsoon_bump=1.0, yieldq=10.0: (cat, live, base, monsoon_bump, yieldq)

CROPS = {
    # --- field crops (trained forecast model also covers these six) ---
    "Rice":            _C("cereals", "Rice", 5200, 1.10, 25),
    "Wheat":           _C("cereals", "Wheat", 3400, 1.02, 14),
    "Maize":           _C("cereals", "Maize", 2450, 1.06, 18),
    "Ragi (Finger Millet)": _C("cereals", "Ragi", 3400, 1.05, 10),
    "Jowar":           _C("cereals", "Jowar (Sorghum)", 2600, 1.03, 12),
    "Bajra":           _C("cereals", "Bajra", 2200, 1.03, 10),
    "Groundnut":       _C("oilseeds", "Groundnut", 5650, 1.05, 12),
    "Sunflower":       _C("oilseeds", "Sunflower", 6800, 1.04, 9),
    "Soybean":         _C("oilseeds", "Soyabean", 5200, 1.04, 11),
    "Cotton":          _C("fibre", "Cotton", 7500, 1.02, 7),
    "Sugarcane":       _C("sugarcane", "Sugarcane", 3300, 1.05, 500),
    "Tur (Arhar)":     _C("pulses", "Tur (Arhar)", 8200, 1.04, 6),
    "Bengal Gram":     _C("pulses", "Bengal Gram (Chana)", 6800, 1.03, 8),
    "Green Gram":      _C("pulses", "Green Gram (Moong)", 7800, 1.03, 5),
    "Black Gram":      _C("pulses", "Black Gram (Urad)", 7900, 1.03, 5),
    # --- vegetables (the "more crops" the marketplace needs) ---
    "Tomato":          _C("vegetables", "Tomato", 2200, 0.85, 150),
    "Onion":           _C("vegetables", "Onion", 3000, 0.90, 110),
    "Potato":          _C("vegetables", "Potato", 1450, 0.88, 120),
    "Brinjal":         _C("vegetables", "Brinjal", 2100, 0.88, 140),
    "Bhendi (Okra)":   _C("vegetables", "Bhendi", 3400, 0.90, 85),
    "Green Chilli":    _C("vegetables", "Green Chilli", 3800, 0.86, 100),
    "Dry Chilli":      _C("spices", "Dry Chilli", 12000, 0.90, 12),
    "Cabbage":         _C("vegetables", "Cabbage", 1400, 0.90, 180),
    "Cauliflower":     _C("vegetables", "Cauliflower", 1500, 0.90, 120),
    "Carrot":          _C("vegetables", "Carrot", 1900, 0.92, 110),
    "French Beans":    _C("vegetables", "French Beans", 4800, 0.88, 75),
    "Cluster Beans":   _C("vegetables", "Cluster Beans", 4200, 0.88, 70),
    "Cucumber":        _C("vegetables", "Cucumber", 2000, 0.88, 120),
    "Bottle Gourd":    _C("vegetables", "Bottle Gourd", 1600, 0.90, 140),
    "Bitter Gourd":    _C("vegetables", "Bitter Gourd", 2600, 0.86, 100),
    "Pumpkin":         _C("vegetables", "Pumpkin", 1500, 0.90, 160),
    "Radish":          _C("vegetables", "Radish", 1300, 0.92, 120),
    "Beetroot":        _C("vegetables", "Beetroot", 1700, 0.92, 110),
    "Drumstick":       _C("vegetables", "Drumstick", 5200, 0.85, 40),
    # --- fruits ---
    "Banana":          _C("fruits", "Banana", 3400, 0.95, 200),
    "Mango":           _C("fruits", "Mango", 4200, 0.90, 80),
    "Grapes":          _C("fruits", "Grapes", 5600, 0.85, 150),
    "Papaya":          _C("fruits", "Papaya", 2400, 0.95, 250),
    "Watermelon":      _C("fruits", "Watermelon", 1600, 0.92, 220),
    "Sweet Lime (Mosambi)": _C("fruits", "Sweet Lemon", 3000, 0.95, 120),
    "Lemon":           _C("fruits", "Lemon", 5800, 0.90, 90),
    "Sapota (Chiku)":  _C("fruits", "Sapota", 3000, 0.95, 130),
}

# district -> (distance_km_from_hub, price_offset, soil, water, live name hints)
DISTRICTS = {
    "Belagavi": (470, 1.04, "Black soil", "Low"),
    "Bellary": (300, 1.06, "Black soil", "Low"),
    "Bengaluru": (0, 1.00, "Red soil", "High"),
    "Bengaluru Rural": (30, 1.00, "Red soil", "High"),
    "Chamarajanagar": (160, 0.98, "Red soil", "Medium"),
    "Chikkaballapura": (65, 0.97, "Red soil", "Low"),
    "Chitradurga": (200, 1.02, "Red soil", "Low"),
    "Dakshina Kannada": (330, 1.12, "Laterite", "High"),
    "Davanagere": (260, 1.01, "Black soil", "Medium"),
    "Gadag": (420, 1.00, "Black soil", "Low"),
    "Hassan": (180, 1.00, "Red soil", "Medium"),
    "Haveri": (340, 1.00, "Black soil", "Low"),
    "Kolar": (70, 0.96, "Red soil", "Low"),
    "Koppal": (380, 1.05, "Black soil", "Low"),
    "Mandya": (100, 0.97, "Alluvial", "High"),
    "Mysuru": (150, 0.99, "Red soil", "Medium"),
    "Raichur": (340, 1.07, "Black soil", "Low"),
    "Shivamogga": (270, 1.03, "Red soil", "High"),
    "Tumakuru": (70, 0.97, "Red soil", "Low"),
    "Udupi": (380, 1.12, "Laterite", "High"),
    "Vijayapura": (520, 1.03, "Black soil", "Low"),
}

DEFAULT_DISTRICT = "Bengaluru"

# ---------------------------------------------------------------------------
# Per-market intelligence universe.
# Market names are real Karnataka regulated APMCs; each is anchored to its
# district hub with an intra-district distance. Hub coordinates are the
# (approx) district headquarter coordinates — used only to turn a browser GPS
# fix into a real haversine distance; every distance is labelled accordingly.
# ---------------------------------------------------------------------------
HUB_COORDS = {
    # district -> (latitude, longitude) of the district HQ (approx)
    "Belagavi": (15.8497, 74.4977),
    "Bellary": (15.1394, 76.9214),
    "Bengaluru": (12.9716, 77.5946),
    "Bengaluru Rural": (13.2955, 77.5396),
    "Chamarajanagar": (11.9261, 76.9437),
    "Chikkaballapura": (13.4357, 77.7319),
    "Chitradurga": (14.2305, 76.4000),
    "Dakshina Kannada": (12.9141, 74.8560),
    "Davanagere": (14.4644, 75.9218),
    "Gadag": (15.4299, 75.6298),
    "Hassan": (13.0072, 76.0944),
    "Haveri": (14.7944, 75.4000),
    "Kolar": (13.1364, 78.1291),
    "Koppal": (15.3450, 76.1546),
    "Mandya": (12.5223, 76.8955),
    "Mysuru": (12.2958, 76.6394),
    "Raichur": (16.2070, 77.3443),
    "Shivamogga": (13.9299, 75.5681),
    "Tumakuru": (13.3379, 77.1173),
    "Udupi": (13.3409, 74.7421),
    "Vijayapura": (16.8302, 75.7100),
}

# district -> list of (APMC market name, km from district hub)
APMC_MARKETS = {
    "Belagavi": [("Belagavi APMC", 0.0)],
    "Bellary": [("Bellary APMC", 0.0)],
    "Bengaluru": [
        ("Bangalore", 6.0), ("Bengaluru APMC", 10.0), ("Hoskote", 31.0),
        ("Doddaballa Pur", 38.0), ("Ramanagara", 48.0), ("Santhesargur", 92.0),
    ],
    "Bengaluru Rural": [("Nelamangala APMC", 25.0), ("Devanahalli APMC", 35.0)],
    "Chamarajanagar": [("Chamarajanagar APMC", 0.0), ("Kollegal APMC", 40.0)],
    "Chikkaballapura": [("Chikkaballapura APMC", 0.0), ("Chintamani APMC", 45.0)],
    "Chitradurga": [("Chitradurga APMC", 0.0), ("Challakere APMC", 45.0)],
    "Dakshina Kannada": [("Mangaluru APMC", 0.0)],
    "Davanagere": [("Davanagere APMC", 0.0), ("Harihar APMC", 25.0)],
    "Gadag": [("Gadag APMC", 0.0)],
    "Hassan": [("Hassan APMC", 0.0), ("Arsikere APMC", 30.0), ("Holenarasipura APMC", 35.0)],
    "Haveri": [("Haveri APMC", 0.0), ("Ranebennur APMC", 45.0)],
    "Kolar": [("Kolar APMC", 0.0), ("Srinivasapura APMC", 35.0), ("Mulbagal APMC", 40.0)],
    "Koppal": [("Koppal APMC", 0.0), ("Gangavati APMC", 35.0)],
    "Mandya": [("Mandya APMC", 0.0), ("Pandavapura APMC", 25.0), ("Maddur APMC", 45.0)],
    "Mysuru": [
        ("Mysuru APMC", 5.0), ("Mysore (Bandipalya)", 15.0), ("Nanjangud", 23.0),
        ("Hunsur", 27.0), ("T. Narasipura", 32.0), ("K.R.Nagar", 48.0),
        ("Periyapatna APMC", 55.0), ("Piriya Pattana", 55.0),
    ],
    "Raichur": [("Raichur APMC", 0.0), ("Sindhanur APMC", 45.0)],
    "Shivamogga": [("Shivamogga APMC", 0.0), ("Bhadravati APMC", 20.0)],
    "Tumakuru": [("Tumakuru APMC", 0.0), ("Tiptur APMC", 45.0), ("Madhugiri APMC", 50.0)],
    "Udupi": [("Udupi APMC", 0.0), ("Kundapura APMC", 40.0)],
    "Vijayapura": [("Vijayapura APMC", 0.0), ("Jamkhandi APMC", 50.0)],
}

# crop -> list of the varieties commonly traded at Karnataka APMCs (first = default)
VARIETIES = {
    "Rice": ["Jaya", "BPT 5204", "Sona Masuri", "Sannakki"],
    "Wheat": ["Fine", "Lokwan", "MP Sharbati"],
    "Maize": ["Hybrid", "Local"],
    "Ragi (Finger Millet)": ["Local", "Indaf"],
    "Jowar": ["Local", "Maldandi"],
    "Bajra": ["Local", "Hybrid"],
    "Groundnut": ["Big (With Shell)", "Bold", "Local"],
    "Sunflower": ["Hybrid", "Local"],
    "Soybean": ["JS 335", "Local"],
    "Cotton": ["H-4(A) 27mm Fine", "Shankar-6", "DCH-32"],
    "Sugarcane": ["CO-86032", "Local"],
    "Tur (Arhar)": ["Local", "Hybrid"],
    "Bengal Gram": ["Local", "Green", "Kabuli"],
    "Green Gram": ["Local", "Hybrid"],
    "Black Gram": ["Local", "Hybrid"],
    "Tomato": ["Local", "Hybrid"],
    "Onion": ["Red", "Bellary", "Hybrid"],
    "Potato": ["Kufri", "Jyoti"],
    "Brinjal": ["Local", "Hybrid"],
    "Bhendi (Okra)": ["Local", "Hybrid"],
    "Green Chilli": ["Local", "Hybrid"],
    "Dry Chilli": ["Byadgi", "Guntur", "Local"],
    "Cabbage": ["Local", "Hybrid"],
    "Cauliflower": ["Local", "Hybrid"],
    "Carrot": ["Local", "Hybrid"],
    "French Beans": ["Local", "Hybrid"],
    "Cluster Beans": ["Local", "Hybrid"],
    "Cucumber": ["Local", "Hybrid"],
    "Bottle Gourd": ["Local", "Hybrid"],
    "Bitter Gourd": ["Local", "Hybrid"],
    "Pumpkin": ["Local", "Hybrid"],
    "Radish": ["Local", "Hybrid"],
    "Beetroot": ["Local", "Hybrid"],
    "Drumstick": ["Local"],
    "Banana": ["Robusta", "Poovan", "Yelakki"],
    "Mango": ["Alphonso", "Totapuri", "Rasalpuri", "Malgoa"],
    "Grapes": ["Bangalore Blue", "Sharad", "Thompson"],
    "Papaya": ["Red Lady", "Local"],
    "Watermelon": ["Local", "Hybrid"],
    "Sweet Lime (Mosambi)": ["Local", "Seedless"],
    "Lemon": ["Local"],
    "Sapota (Chiku)": ["Kalipatti", "Cricket Ball"],
}

_SEASONS = {
    # month index (1..12) -> amplitude for "harvest abundance" dip/price bump
    "Rice": {10: 1.18, 11: 1.12, 12: 1.05},
    "Onion": {2: 1.25, 3: 1.18},
    "Tomato": {1: 1.12, 7: 0.92},
    "Potato": {2: 1.15, 11: 1.08},
    "Mango": {4: 0.9, 5: 0.92},
    "Green Chilli": {6: 1.1, 9: 1.15},
    "Grapes": {2: 1.1, 12: 1.05},
    "Cotton": {3: 1.1, 4: 1.05},
    "Groundnut": {2: 1.12, 9: 1.06},
    "Maize": {9: 1.1, 10: 1.08},
    "Sugarcane": {3: 1.06},
}

_CV = {  # yield uncertainty per category (coefficient of variation)
    "cereals": 0.14, "oilseeds": 0.16, "pulses": 0.18, "fibre": 0.16,
    "sugarcane": 0.10, "vegetables": 0.20, "fruits": 0.22, "spices": 0.20,
}

_MATURITY_MONTHS = {  # approx season length (sow -> harvest)
    "Rice": 4.5, "Maize": 3.5, "Ragi (Finger Millet)": 3.5, "Wheat": 4.0,
    "Jowar": 3.5, "Bajra": 3.0, "Groundnut": 4.0, "Sunflower": 3.5,
    "Soybean": 3.5, "Cotton": 5.5, "Sugarcane": 12.0, "Tomato": 3.0,
    "Onion": 4.0, "Potato": 3.0, "Brinjal": 3.5, "Green Chilli": 3.5,
    "Cabbage": 3.0, "Cauliflower": 3.0, "Carrot": 3.0, "Bhendi (Okra)": 2.5,
    "French Beans": 2.5, "Cucumber": 2.5, "Bottle Gourd": 3.0, "Bitter Gourd": 3.0,
    "Banana": 12.0, "Papaya": 9.0, "Grapes": 8.0, "Mango": 24.0,
}

_random = random.Random(20260912)

# ---------------------------------------------------------------------------
# Rate-limit guard: at most _MODEL_LIMIT live HTTP calls per rolling window,
# and a failed crop is retried only after RETRY_COOLDOWN_S.
# ---------------------------------------------------------------------------
_MODEL_LIMIT = 7
_MODEL_WINDOW_S = 45.0
_FETCH_HISTORY = []
_seeded = False


def _ensure(db):
    """Run once: make sure feed_state has the `ok` column on old databases."""
    global _seeded
    if _seeded:
        return
    try:
        db.execute("ALTER TABLE feed_state ADD COLUMN ok INTEGER")
        db.commit()
    except sqlite3.OperationalError:
        pass
    try:
        db.execute("ALTER TABLE price_snapshots ADD COLUMN arrival_quantity REAL")
        db.commit()
    except sqlite3.OperationalError:
        pass
    _seeded = True


def _quota_ok():
    now = time.time()
    _FETCH_HISTORY[:] = [t for t in _FETCH_HISTORY if now - t < _MODEL_WINDOW_S]
    if len(_FETCH_HISTORY) >= _MODEL_LIMIT:
        return False
    _FETCH_HISTORY.append(now)
    return True


# ---------------------------------------------------------------------------
# Background pre-warm: after the first snapshot request, fill the live cache
# for every live-capable crop so later page loads are instant.
# ---------------------------------------------------------------------------
_warm_lock = threading.Lock()
_warm_started = False


def warm_async(db_path):
    global _warm_started
    with _warm_lock:
        if _warm_started:
            return
        _warm_started = True
    threading.Thread(target=_warm_worker, args=(db_path,), daemon=True).start()


def _warm_worker(db_path):
    while True:
        con = sqlite3.connect(db_path)
        con.row_factory = sqlite3.Row
        _ensure(con)
        pending = sorted(k for k, c in CROPS.items() if c[1] and not _feed_fresh(con, k))
        con.close()
        if not pending:
            return
        fetched_any = False
        for k in pending:
            if not _quota_ok():
                time.sleep(14)
                continue
            con = sqlite3.connect(db_path)
            con.row_factory = sqlite3.Row
            _ensure(con)
            _fetch_live(con, k, CROPS[k][1])
            con.close()
            fetched_any = True
        if not fetched_any:
            time.sleep(30)


def catalog():
    return {
        "region": "Karnataka",
        "states": ["Karnataka"],
        "unit": PRICE_UNIT,
        "crops": [{"key": k, "name": k, "category": c[0], "live": bool(c[1])} for k, c in CROPS.items()],
        "districts": [{"name": d, "distanceKm": DISTRICTS[d][0], "soil": DISTRICTS[d][2], "water": DISTRICTS[d][3]} for d in DISTRICTS],
        "varieties": {k: v for k, v in VARIETIES.items()},
    }


def _canonical_district(name):
    if not name:
        return DEFAULT_DISTRICT
    norm = name.strip().lower().replace(" ", "").replace("urban", "").replace("rural", "")
    for d in DISTRICTS:
        if d.lower().replace(" ", "") == norm:
            return d
    return DEFAULT_DISTRICT


def _live_session_key(crop):
    return crop


# ---------------------------------------------------------------------------
# LIVE feed (state-wide per crop, cached in DB)
# ---------------------------------------------------------------------------
def _fetch_live(db, crop, live_name):
    """Hit the mandi API for one crop, store every market row, return rows."""
    _ensure(db)
    if not _quota_ok():
        return []
    now = _dt.datetime.utcnow().isoformat()
    try:
        q = urllib.parse.urlencode({"state": LIVE_STATE, "commodity": live_name})
        req = urllib.request.Request(LIVE_BASE + "/prices?" + q, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as res:
            payload = json.load(res)
    except Exception:
        db.execute(
            "INSERT OR REPLACE INTO feed_state (crop, fetched_at, ok) VALUES (?,?,0)",
            (crop, now))
        db.commit()
        return []
    rows = payload.get("data", []) if isinstance(payload, dict) else []
    db.execute(
        "INSERT OR REPLACE INTO feed_state (crop, fetched_at, ok) VALUES (?,?,1)",
        (crop, now))
    if not rows:
        db.commit()
        return []
    for r in rows:
        db.execute(
            """INSERT OR REPLACE INTO price_snapshots
               (crop, district, market, variety, min_price, modal_price, max_price,
                unit, arrival_date, fetched_at, source, arrival_quantity)
               VALUES (?,?,?,?,?,?,?,?,?,?, 'live', ?)""",
            (crop, r.get("district"), r.get("market"), r.get("variety"),
             r.get("min_price"), r.get("modal_price"), r.get("max_price"),
             "₹/quintal", r.get("arrival_date"), now, r.get("arrival_quantity")),
        )
    db.commit()
    return rows


def _best_live_row(db, crop, district):
    rows = db.execute(
        """SELECT * FROM price_snapshots WHERE crop = ? AND source = 'live'
           ORDER BY fetched_at DESC""", (crop,)).fetchall()
    if not rows:
        return None
    exact = [r for r in rows if _canonical_district(r["district"]) == district]
    pick = exact[0] if exact else rows[0]
    near = {"exact": bool(exact), "market": pick["market"], "district": pick["district"]}
    return pick, near


def _feed_fresh(db, crop):
    row = db.execute("SELECT fetched_at, ok FROM feed_state WHERE crop = ?", (crop,)).fetchone()
    if not row or not row["fetched_at"]:
        return False
    try:
        age = _dt.datetime.utcnow() - _dt.datetime.fromisoformat(row["fetched_at"])
    except Exception:
        return False
    if row["ok"] == 1:
        return age.total_seconds() < SNAPSHOT_TTL_S
    return age.total_seconds() < RETRY_COOLDOWN_S


def _history_feed_fresh(db, crop):
    row = db.execute("SELECT fetched_at, ok FROM history_feed_state WHERE crop = ?", (crop,)).fetchone()
    if not row or not row["fetched_at"]:
        return False
    try:
        age = _dt.datetime.utcnow() - _dt.datetime.fromisoformat(row["fetched_at"])
    except Exception:
        return False
    if row["ok"] == 1:
        return age.total_seconds() < SNAPSHOT_TTL_S
    return age.total_seconds() < RETRY_COOLDOWN_S


def _fetch_daily(db, crop, live_name, days):
    """State-wide daily average history for a crop (live), cached in DB."""
    _ensure(db)
    if not _quota_ok():
        return {}
    now = _dt.datetime.utcnow().isoformat()
    try:
        q = urllib.parse.urlencode({"state": LIVE_STATE, "commodity": live_name, "days": days})
        req = urllib.request.Request(LIVE_BASE + "/prices/history?" + q, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as res:
            payload = json.load(res)
    except Exception:
        db.execute("INSERT OR REPLACE INTO history_feed_state (crop, fetched_at, ok) VALUES (?,?,0)", (crop, now))
        db.commit()
        return {}
    rows = payload.get("data", []) if isinstance(payload, dict) else []
    db.execute("INSERT OR REPLACE INTO history_feed_state (crop, fetched_at, ok) VALUES (?,?,1)", (crop, now))
    for r in rows:
        db.execute(
            """INSERT OR REPLACE INTO price_history_daily
               (crop, arrival_date, avg_min_price, avg_modal_price, avg_max_price, data_points, fetched_at)
               VALUES (?,?,?,?,?,?,?)""",
            (crop, r.get("arrival_date"), r.get("avg_min_price"), r.get("avg_modal_price"),
             r.get("avg_max_price"), r.get("data_points"), now))
    db.commit()
    return {r.get("arrival_date"): r.get("avg_modal_price") for r in rows if r.get("arrival_date")}


# ---------------------------------------------------------------------------
# MODEL price (deterministic per crop × district)
# ---------------------------------------------------------------------------
def _seasonal(crop, month):
    base = 1.0
    for m, amp in _SEASONS.get(crop, {}).items():
        dist = abs(((m - month) + 6) % 12 - 6)
        base += (amp - 1.0) * max(0.0, 1.0 - dist / 3.0)
    return base


def _model_price(crop, district):
    cat, live, base, monsoon_bump, _y = CROPS[crop]
    dkm, offset, _soil, _water = DISTRICTS[_canonical_district(district)]
    month = _dt.date.today().month
    season = _seasonal(crop, month)
    wave = 1.0 + 0.05 * math.sin((_dt.date.today().toordinal() / 9.0) * (1 + (hash(crop) % 5) * 0.07))
    modal = base * offset * season * wave * monsoon_bump
    modal = round(modal, 1)
    return {"modalPrice": modal, "minPrice": round(modal * 0.86, 1), "maxPrice": round(modal * 1.14, 1)}


def price(db, crop, district=None):
    _ensure(db)
    district = _canonical_district(district or DEFAULT_DISTRICT)
    if crop not in CROPS:
        raise ValueError(crop)
    _cat, live, _base, _b, _y = CROPS[crop]
    near = {}
    if live:
        if not _feed_fresh(db, crop):
            _fetch_live(db, crop, live)
        pick = _best_live_row(db, crop, district)
        if pick is not None:
            _lr, near = pick
            return {
                "crop": crop, "district": district, "unit": "₹/quintal",
                "modalPrice": round(float(_lr["modal_price"]), 1),
                "minPrice": round(float(_lr["min_price"] or 0), 1),
                "maxPrice": round(float(_lr["max_price"] or 0), 1),
                "market": _lr["market"], "variety": _lr["variety"],
                "arrivalDate": _lr["arrival_date"], "fetchedAt": _lr["fetched_at"],
                "source": "live" if near.get("exact") else "live-near",
                "sourceMarket": near.get("market"),
            }
    m = _model_price(crop, district)
    return {
        "crop": crop, "district": district, "unit": "₹/quintal",
        "modalPrice": m["modalPrice"], "minPrice": m["minPrice"], "maxPrice": m["maxPrice"],
        "market": None, "variety": None, "arrivalDate": None, "fetchedAt": None,
        "source": "model", "sourceMarket": None,
    }


def live_state(db, crop):
    """Is this crop wired to (and currently backed by) live data? Read-only."""
    _cat, live, _b, _m, _y = CROPS[crop]
    if not live:
        return False
    return _best_live_row(db, crop, DEFAULT_DISTRICT) is not None


def history(db, crop, district=None, days=90):
    _ensure(db)
    district = _canonical_district(district or DEFAULT_DISTRICT)
    if crop not in CROPS:
        raise ValueError(crop)
    _cat, live, base, monsoon_bump, _y = CROPS[crop]
    days = max(7, min(int(days), 365))

    daily = {}
    if live:
        fresh = _history_feed_fresh(db, crop)
        have = db.execute(
            "SELECT COUNT(*) AS n FROM price_history_daily WHERE crop = ?", (crop,)).fetchone()["n"]
        if not fresh or have < min(days, 7):
            daily = _fetch_daily(db, crop, live, days)
        if not daily:
            rows = db.execute(
                """SELECT arrival_date, avg_modal_price FROM price_history_daily
                   WHERE crop = ? AND avg_modal_price IS NOT NULL
                   ORDER BY arrival_date DESC LIMIT ?""", (crop, days)).fetchall()
            daily = {r["arrival_date"]: float(r["avg_modal_price"]) for r in rows}
        points = [{"d": d, "v": round(v, 1), "f": False} for d, v in sorted(daily.items())]
        if points:
            return {
                "crop": crop, "district": district, "points": points,
                "unit": "₹/quintal", "source": "live",
            }

    today = _dt.date.today()
    start = today - _dt.timedelta(days=days)
    off = DISTRICTS[district][1]
    points = []
    for i in range(days):
        d = start + _dt.timedelta(days=i)
        month = d.month
        season = _seasonal(crop, month)
        wave = 1.0 + 0.05 * math.sin((d.toordinal() / 9.0) * (1 + (hash(crop) % 5) * 0.07))
        drag = 1.0 - min(0.10, 0.0006 * (days - i))
        v = base * off * season * wave * monsoon_bump * drag
        points.append({"d": d.isoformat(), "v": round(v, 1), "f": False})
    return {
        "crop": crop, "district": district, "points": points,
        "unit": "₹/quintal", "source": "model",
    }


def district_comparison(db, crop, district=None):
    district = _canonical_district(district or DEFAULT_DISTRICT)
    rows = []
    for d in DISTRICTS:
        p = price(db, crop, d)
        rkm, _o, _s, _w = DISTRICTS[d]
        transport_kg = 1.1 + rkm * 0.55 / 100.0
        gross = p["modalPrice"] / 100.0          # per kg
        rows.append({**p, "distance": rkm, "net": round(gross - transport_kg, 2)})
    rows.sort(key=lambda r: -r["net"])
    best = rows[0]["net"]
    for r in rows:
        r["best"] = abs(r["net"] - best) < 0.01
    return {"crop": crop, "referenceDistrict": district, "unit": "₹/kg net",
            "markets": rows,
            "transportNote": "Net = live/modal price per kg minus estimated haulage (₹/km). Live prices where the feed covers the district, model elsewhere."}


# ---------------------------------------------------------------------------
# Per-market intelligence — APMC universe, location-aware distances and
# per-market prices (live rows when fresh, the deterministic model otherwise).
# ---------------------------------------------------------------------------
def _haversine_km(lat1, lng1, lat2, lng2):
    if lat1 is None or lng1 is None:
        return None
    R = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = (math.sin(dp / 2) ** 2
         + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _name_key(name):
    return (str(name or "").strip().lower()
            .replace(" ", "").replace(".", "").replace("-", "").replace("(", "").replace(")", ""))


def _market_distance(farm_lat, farm_lng, market_district, intra_km, farm_district):
    """Distance (km) from the farmer to a market.

    Priority:
    1. Browser GPS fix — real haversine to the market's district hub.
    2. Known farm district — haversine between the two district hubs (approx,
       monotonic and real) plus the market's intra-district distance.
    3. Fallback — seeded hub-distance table, clearly approximate.
    """
    if farm_district:
        farm_district = _canonical_district(farm_district)
        market_district = _canonical_district(market_district)
    if farm_lat is not None and farm_lng is not None and market_district in HUB_COORDS:
        c = HUB_COORDS[market_district]
        km = _haversine_km(float(farm_lat), float(farm_lng), c[0], c[1])
        if km is not None:
            return max(0.5, round(km, 1)), "live"
    if market_district == farm_district:
        return max(1.0, round(float(intra_km), 1)), "district"
    if farm_district in HUB_COORDS and market_district in HUB_COORDS:
        fa, fb = HUB_COORDS[farm_district], HUB_COORDS[market_district]
        km = _haversine_km(fa[0], fa[1], fb[0], fb[1])
        if km is not None:
            return max(1.0, round(km + intra_km, 1)), "district"
    a, b = DISTRICTS[farm_district][0], DISTRICTS[market_district][0]
    return max(1.0, round(float(abs(b - a)) + intra_km, 1)), "district"


def _market_price_row(db, crop, district, market_name, variety, live_rows, intra_km=0.0):
    """Pick a live feed row for this exact market, else the deterministic model."""
    mk = _name_key(market_name)
    named = [r for r in live_rows if mk and r["market"] and _name_key(r["market"]) == mk]
    if not named:
        named = [r for r in live_rows
                 if r["district"]
                 and (not r["market"] or _name_key(r["market"]) == mk)
                 and _canonical_district(r["district"]) == district]
    if named:
        r = named[0]
        try:
            qty = None if r["arrival_quantity"] is None else float(r["arrival_quantity"])
        except (TypeError, ValueError):
            qty = None
        return {
            "source": "live", "modalPrice": round(float(r["modal_price"] or 0), 1),
            "minPrice": round(float(r["min_price"] or 0), 1),
            "maxPrice": round(float(r["max_price"] or 0), 1),
            "arrivalDate": r["arrival_date"], "updatedAt": r["fetched_at"],
            "marketVariety": r["variety"], "arrivalQty": qty,
            "quantityNote": (f"Feed reports ~{int(qty):,} q arrived"
                             if qty is not None
                             else "Feed did not report an arrival quantity"),
        }
    m = _model_price(crop, district)
    # Sister markets in the same district differ marginally: the farther an
    # APMC is from the district hub, the lower the typical modal it achieves
    # (deterministic, clearly a model estimate, capped at a 5% swing).
    factor = 1.0 - 0.00055 * max(0.0, float(intra_km or 0))
    factor = max(0.95, min(1.0, factor))
    return {
        "source": "model", "modalPrice": round(m["modalPrice"] * factor, 1),
        "minPrice": round(m["minPrice"] * factor, 1),
        "maxPrice": round(m["maxPrice"] * factor, 1),
        "arrivalDate": None, "updatedAt": None,
        "marketVariety": None, "arrivalQty": None,
        "quantityNote": "Model estimate — verify at the mandi yard",
    }


def markets_for_location(db, crop, district=None, variety=None,
                         farm_district=None, lat=None, lng=None):
    """All relevant APMC/sub-markets for a location, individually priced.

    The selected district's own markets come first (inDistrict), then the main
    APMC of every other district so the comparison and 'best market' views can
    rank real options by net price.
    """
    _ensure(db)
    district = _canonical_district(district or DEFAULT_DISTRICT)
    farm_district = _canonical_district(farm_district or district)
    if crop not in CROPS:
        raise ValueError(crop)
    variety = (variety or (VARIETIES.get(crop) or ["Local"])[0]).strip()

    _cat, is_live, _base, _b, _y = CROPS[crop]
    if is_live and not _feed_fresh(db, crop):
        _fetch_live(db, crop, is_live)
    live_rows = db.execute(
        "SELECT * FROM price_snapshots WHERE crop = ? AND source = 'live'",
        (crop,)).fetchall()

    primaries = APMC_MARKETS.get(district) or [(district + " APMC", 0.0)]
    markets = []
    for nm, intra in primaries:
        markets.append(_build_market_row(db, crop, district, nm, intra, True,
                                         variety, farm_district, lat, lng, live_rows))
    for d in DISTRICTS:
        if d == district:
            continue
        nm, intra = (APMC_MARKETS.get(d) or [(d + " APMC", 0.0)])[0]
        markets.append(_build_market_row(db, crop, d, nm, intra, False,
                                         variety, farm_district, lat, lng, live_rows))

    return {
        "crop": crop, "district": district, "farmDistrict": farm_district,
        "variety": variety, "unit": PRICE_UNIT, "markets": markets,
    }


def _build_market_row(db, crop, district, name, intra, in_district, variety,
                      farm_district, lat, lng, live_rows):
    p = _market_price_row(db, crop, district, name, variety, live_rows, intra_km=intra)
    km, mode = _market_distance(lat, lng, district, intra, farm_district)
    same_as_farm = district == farm_district
    if mode == "live":
        label = f"≈{km:g} km from you"
    elif same_as_farm:
        label = f"In {district}" + (f" · {intra:g} km from hub" if intra > 0 else "")
    else:
        label = f"≈{km:g} km"
    return {
        "id": _name_key(district) + "-" + _name_key(name),
        "name": name, "district": district, "inDistrict": in_district,
        "intraKm": round(intra, 1), "distanceKm": round(km, 1),
        "distanceLabel": label, "distanceMode": mode,
        "minPrice": p["minPrice"], "modalPrice": p["modalPrice"], "maxPrice": p["maxPrice"],
        "arrivalDate": p["arrivalDate"], "updatedAt": p["updatedAt"],
        "arrivalQty": p["arrivalQty"], "quantityNote": p["quantityNote"],
        "source": p["source"], "marketVariety": p["marketVariety"], "variety": variety,
    }


def market_trend(db, crop, district=None, days=14):
    """Short-window price movement (%) for a crop + district (live or model)."""
    district = _canonical_district(district or DEFAULT_DISTRICT)
    try:
        h = history(db, crop, district, max(30, days + 2))
    except ValueError:
        return {"pct": 0.0, "window": "7d", "source": "model"}
    pts = [pt for pt in h["points"] if not pt.get("f")]
    if len(pts) < 8:
        return {"pct": 0.0, "window": "7d", "source": h["source"]}
    tail = pts[-8:]
    old, new = tail[0]["v"], tail[-1]["v"]
    pct = round((new - old) / old * 100.0, 1) if old else 0.0
    return {"pct": pct, "window": "7d", "source": h["source"]}


# ---------------------------------------------------------------------------
# YIELD prediction (district × crop baseline with farm inputs)
# ---------------------------------------------------------------------------
SOIL_FACTOR = {"Red soil": 1.0, "Black soil": 1.06, "Alluvial": 1.08, "Laterite": 0.88}
WATER_FACTOR = {"High": 1.08, "Medium": 1.0, "Low": 0.86}


def predict_yield(db, crop, district="Bengaluru", acres=1.0, sow_date=None,
                  soil_type=None, water=None):
    if crop not in CROPS:
        raise ValueError(crop)
    district = _canonical_district(district)
    _cat, _live, _b, _m, _y = CROPS[crop]
    base = float(_y)
    _km, _off, dsoil, dwater = DISTRICTS[district]

    if not sow_date:
        sow_date = _dt.date.today().isoformat()
    try:
        sd = _dt.date.fromisoformat(str(sow_date))
    except ValueError:
        sd = _dt.date.today()
    if sd < _dt.date.today():
        sd = _dt.date.today()

    soil = soil_type or dsoil
    water = water or dwater
    mat_m = _MATURITY_MONTHS.get(crop, 3.5)
    harvest = sd + _dt.timedelta(days=int(mat_m * 30))
    harvest_month = harvest.month

    pref = SOIL_FACTOR.get(soil, 1.0) * WATER_FACTOR.get(water, 1.0)
    seas = 1.0 + 0.06 * _seasonal(crop, harvest_month)
    scale = max(0.0, math.log(acres + 1) / math.log(acres + 1.35)) if acres > 0 else 1.0
    area = 1.0 - min(0.06, 0.0015 * max(0.0, acres - 2))
    expected = base * pref * seas * area
    cv = _CV.get(_cat, 0.2)
    pmin = expected * (1 - 1.1 * cv)
    pmax = expected * (1 + 1.1 * cv)
    confidence = round(100 * (1 - cv), 0)

    total_q = expected * max(acres, 0.1) if acres > 0 else 0.0
    return {
        "crop": crop, "district": district,
        "sowDate": sd.isoformat(), "harvestAt": harvest.isoformat(),
        "acres": acres, "seasonLengthMonths": round(mat_m, 1),
        "expectedYieldQPerAcre": round(expected, 1),
        "expectedYieldKgPerAcre": round(expected * 100, 0),
        "minYieldQPerAcre": round(max(0.1, pmin), 1),
        "maxYieldQPerAcre": round(pmax, 1),
        "totalYieldQ": round(total_q, 1),
        "totalYieldKg": round(total_q * 100, 0),
        "confidence": confidence,
        "factors": [
            {"title": "District baseline", "value": f"{base:g} q/acre", "detail": f"{district} baseline for {crop}."},
            {"title": "Soil (current: {soil})".format(soil=soil or dsoil), "value": f"×{SOIL_FACTOR.get(soil,1.0):.2f}", "detail": "Suitability of your reported soil type."},
            {"title": "Water availability", "value": f"×{WATER_FACTOR.get(water,1.0):.2f}", "detail": f"Reported water access: {water}."},
            {"title": "Harvest-month seasonality", "value": f"×{seas:.2f}", "detail": f"Expected patch for a harvest around {harvest.strftime('%b %Y')}."},
        ],
        "note": "Yield is a statistical estimate from district baselines and farm inputs — actual output varies with weather and management",
    }