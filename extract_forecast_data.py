"""
Extracts data from the Prophet/HoltWinters crop_price_forecast_bundle.pkl
WITHOUT needing prophet/cmdstanpy installed, by stubbing out those classes
during unpickling (we only need the plain-data 'forecast' and 'history'
DataFrames + metadata, not the live model objects).

Run once to produce data/forecast_data.json, which the Flask app then
loads directly (no prophet/cmdstanpy dependency at serve time).
"""
import pickle
import io
import json
import sys

SRC_PKL = sys.argv[1] if len(sys.argv) > 1 else "/mnt/user-data/uploads/1788956102457_crop_price_forecast_bundle__1_.pkl"
OUT_JSON = sys.argv[2] if len(sys.argv) > 2 else "/home/claude/agriconnect_app/data/forecast_data.json"

_stub_cache = {}


def get_stub_class(module, name):
    """Create a permissive placeholder class for any module we don't have
    installed (prophet, cmdstanpy, stanio, ...). It supports enough of the
    pickle protocol (BUILD/__setstate__, SETITEMS, list append/extend) to
    let unpickling finish, without needing the real library at all."""
    key = (module, name)
    if key in _stub_cache:
        return _stub_cache[key]

    def __new__(cls, *a, **k):
        return object.__new__(cls)

    def __init__(self, *a, **k):
        pass

    def __setstate__(self, state):
        if isinstance(state, tuple):
            d = state[0] if state and isinstance(state[0], dict) else {}
            try:
                self.__dict__.update(d)
            except Exception:
                pass
        elif isinstance(state, dict):
            self.__dict__.update(state)
        else:
            self.__dict__["_state"] = state

    def __setitem__(self, k, v):
        if not hasattr(self, "_items"):
            object.__setattr__(self, "_items", {})
        self._items[k] = v

    def __getitem__(self, k):
        return self._items[k]

    def append(self, v):
        if not hasattr(self, "_list"):
            object.__setattr__(self, "_list", [])
        self._list.append(v)

    def extend(self, v):
        if not hasattr(self, "_list"):
            object.__setattr__(self, "_list", [])
        self._list.extend(v)

    cls = type(
        name,
        (object,),
        {
            "__new__": __new__,
            "__init__": __init__,
            "__setstate__": __setstate__,
            "__setitem__": __setitem__,
            "__getitem__": __getitem__,
            "append": append,
            "extend": extend,
            "__module__": module,
        },
    )
    _stub_cache[key] = cls
    return cls


REAL_PREFIXES = ("pandas", "numpy", "builtins", "collections", "__builtin__")


class SafeUnpickler(pickle.Unpickler):
    def find_class(self, module, name):
        if module.startswith(REAL_PREFIXES):
            try:
                return super().find_class(module, name)
            except Exception:
                return get_stub_class(module, name)
        return get_stub_class(module, name)


def load_bundle(path):
    with open(path, "rb") as f:
        data = f.read()
    return SafeUnpickler(io.BytesIO(data)).load()


def df_to_records(df, cols):
    out = []
    for _, row in df.iterrows():
        rec = {}
        for c in cols:
            if c not in df.columns:
                continue
            v = row[c]
            if hasattr(v, "isoformat"):
                v = v.date().isoformat()
            elif hasattr(v, "item"):
                v = v.item()
            rec[c] = v
        out.append(rec)
    return out


def compute_recommendation(commodity, r, horizon_days=90):
    """Score = expected price growth over the forecast horizon, discounted
    by how unreliable that commodity's model historically was (mae_pct).
    This is a PRICE-TREND proxy for 'worth growing', not real demand/volume
    data (the bundle doesn't contain volume/demand figures)."""
    last_price = float(r["last_actual_price"])
    last_date = r["last_actual_date"]
    fc = r["forecast"]

    future = fc[fc["ds"] > last_date]
    if future.empty:
        future = fc

    horizon_cutoff = last_date + __import__("pandas").Timedelta(days=horizon_days)
    near_term = future[future["ds"] <= horizon_cutoff]
    if near_term.empty:
        near_term = future.head(13)  # ~13 weeks ~ 90 days of weekly data

    projected_price = float(near_term["yhat"].mean())
    growth_pct = (projected_price - last_price) / last_price * 100 if last_price else 0.0

    mae_pct = float(r.get("mae_pct", 50.0) or 50.0)
    confidence = max(0.0, 1.0 - min(mae_pct, 100.0) / 100.0)  # 0..1, higher = more reliable
    score = growth_pct * confidence

    return {
        "commodity": commodity,
        "method": r["method"],
        "last_actual_price": round(last_price, 2),
        "last_actual_date": last_date.date().isoformat(),
        "projected_price_90d": round(projected_price, 2),
        "growth_pct_90d": round(growth_pct, 2),
        "mae": round(float(r["mae"]), 2),
        "mae_pct": round(mae_pct, 2),
        "confidence": round(confidence * 100, 1),
        "score": round(score, 2),
    }


def main():
    print(f"Loading {SRC_PKL} ...")
    obj = load_bundle(SRC_PKL)
    results = obj["results"]

    output = {
        "available_commodities": obj["available_commodities"],
        "resample_weekly": obj["resample_weekly"],
        "agg_method": obj["agg_method"],
        "commodities": {},
        "recommendations": [],
    }

    recs = []
    for commodity, r in results.items():
        hist = r["history"]
        fc = r["forecast"]

        history_records = df_to_records(hist.tail(260), ["ds", "y"])  # last ~5 years weekly
        forecast_records = df_to_records(
            fc[fc["ds"] > r["last_actual_date"]],
            ["ds", "yhat", "yhat_lower", "yhat_upper"],
        )

        output["commodities"][commodity] = {
            "method": r["method"],
            "mae": float(r["mae"]),
            "mean_price": float(r["mean_price"]),
            "mae_pct": float(r["mae_pct"]),
            "last_actual_date": r["last_actual_date"].date().isoformat(),
            "last_actual_price": float(r["last_actual_price"]),
            "history": history_records,
            "forecast": forecast_records,
        }

        recs.append(compute_recommendation(commodity, r))

    recs.sort(key=lambda x: x["score"], reverse=True)
    output["recommendations"] = recs

    with open(OUT_JSON, "w") as f:
        json.dump(output, f)

    print(f"Wrote {OUT_JSON}")
    print("\nRecommendation ranking (price-trend based):")
    for rec in recs:
        print(
            f"  {rec['commodity']:<22} score={rec['score']:>7.2f}  "
            f"growth={rec['growth_pct_90d']:>6.2f}%  confidence={rec['confidence']:>5.1f}%  "
            f"({rec['method']})"
        )


if __name__ == "__main__":
    main()
