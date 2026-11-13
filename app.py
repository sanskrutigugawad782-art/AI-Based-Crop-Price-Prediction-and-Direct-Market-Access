"""
AgriConnect - Smart crop price prediction & recommendation.

Two models power this app:
  1. models/agriconnect_bundle.pkl   -> RandomForestRegressor. Point-in-time
     price prediction for a specific Commodity/District/Market/Variety/Grade
     on a given date.
  2. data/forecast_data.json          -> pre-extracted weekly price forecasts
     (Prophet / Holt-Winters, whichever scored better per commodity) plus a
     derived "which crop to grow next" ranking based on projected price
     growth, discounted by each model's historical error rate.

     This file was produced once by extract_forecast_data.py from the
     original crop_price_forecast_bundle.pkl. We don't need prophet/
     cmdstanpy installed to *serve* the app - only to regenerate the JSON
     from a fresh bundle.
"""
import json
import os
import pickle
import warnings
from datetime import date

import pandas as pd
from flask import Flask, render_template, request

from api import api as api_blueprint, init_db

warnings.filterwarnings("ignore")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "agriconnect_bundle.pkl")
FORECAST_JSON = os.path.join(BASE_DIR, "data", "forecast_data.json")

app = Flask(__name__)

# JSON API (auth, etc.) lives in api.py so the original template routes below
# stay untouched. init_db() creates/seeds the SQLite store on first run.
app.register_blueprint(api_blueprint)
init_db()


@app.after_request
def _cors(resp):
    """Allow the React dev server (and previews) to call the API."""
    origin = request.headers.get("Origin", "*")
    resp.headers["Access-Control-Allow-Origin"] = origin
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    resp.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    return resp

# ---------------------------------------------------------------------------
# Load models / data once at startup
# ---------------------------------------------------------------------------
with open(MODEL_PATH, "rb") as f:
    BUNDLE = pickle.load(f)

RF_MODEL = BUNDLE["model"]
ENCODERS = BUNDLE["encoders"]
GRADE_ORDER = BUNDLE["grade_order"]
COMMODITY_CODE_MAP = BUNDLE["commodity_code_map"]
FEATURE_COLUMNS = BUNDLE["feature_columns"]

with open(FORECAST_JSON) as f:
    FORECAST_DATA = json.load(f)

# Dropdown option lists, taken directly from the trained encoders so the
# form can never submit a value the model wasn't trained on.
COMMODITIES = list(ENCODERS["Commodity"].classes_)
DISTRICTS = list(ENCODERS["District"].classes_)
MARKETS = list(ENCODERS["Market"].classes_)
VARIETIES = list(ENCODERS["Variety"].classes_)
GRADES = list(GRADE_ORDER.keys())
SEASONS = list(ENCODERS["Season"].classes_)

MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]

# Which markets belong to which district (used to filter the Market
# dropdown client-side once a District is chosen).
MARKET_DISTRICT_MAP = {
    "Bengaluru": [
        "Bangalore", "Bangalore APMC", "Bengaluru APMC",
        "Doddaballa Pur", "Doddaballa Pur APMC",
        "Hoskote", "Hoskote APMC",
        "Ramanagara", "Ramanagara APMC",
        "Santhesargur", "Santhesargur APMC",
    ],
    "Mysuru": [
        "Hunsur", "Hunsur APMC",
        "K.R.Nagar", "K.R.Nagar APMC",
        "Mysore (Bandipalya)", "Mysore (Bandipalya) APMC",
        "Mysuru APMC",
        "Nanjangud", "Nanjangud APMC",
        "Periyapatna APMC",
        "Piriya Pattana", "Piriya Pattana APMC",
        "T. Narasipura", "T. Narasipura APMC",
    ],
}


def month_to_season(month: int) -> str:
    """India / Karnataka seasonal mapping used consistently across the app."""
    if month in (12, 1, 2):
        return "Winter"
    if month in (3, 4, 5):
        return "Summer"
    if month in (6, 7, 8, 9):
        return "Monsoon"
    return "Post-Monsoon"


def predict_price(commodity, district, market, variety, grade, day, month, year):
    """Run one point prediction through the RandomForest bundle."""
    season = month_to_season(month)
    row = {
        "Commodity": ENCODERS["Commodity"].transform([commodity])[0],
        "Commodity_Code": COMMODITY_CODE_MAP[commodity],
        "District": ENCODERS["District"].transform([district])[0],
        "Grade": GRADE_ORDER[grade],
        "Market": ENCODERS["Market"].transform([market])[0],
        "Variety": ENCODERS["Variety"].transform([variety])[0],
        "Day": day,
        "Month": month,
        "Year": year,
        "Season": ENCODERS["Season"].transform([season])[0],
    }
    X = pd.DataFrame([row])[FEATURE_COLUMNS]
    pred = RF_MODEL.predict(X)[0]
    return round(float(pred), 2)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.route("/")
def home():
    top_pick = FORECAST_DATA["recommendations"][0]
    return render_template("index.html", top_pick=top_pick)


@app.route("/predict", methods=["GET", "POST"])
def predict():
    context = dict(
        commodities=COMMODITIES,
        districts=DISTRICTS,
        markets=MARKETS,
        varieties=VARIETIES,
        grades=GRADES,
        months=list(enumerate(MONTH_NAMES, start=1)),
        market_district_map=MARKET_DISTRICT_MAP,
        current_year=date.today().year,
        form=request.form,
    )

    if request.method == "POST":
        try:
            commodity = request.form["commodity"]
            district = request.form["district"]
            market = request.form["market"]
            variety = request.form["variety"]
            grade = request.form["grade"]
            month = int(request.form["month"])
            current_year = int(request.form["current_year"])
            future_year = int(request.form["future_year"])

            current_price = predict_price(
                commodity, district, market, variety, grade, 15, month, current_year
            )
            future_price = predict_price(
                commodity, district, market, variety, grade, 15, month, future_year
            )
            change_pct = (
                round((future_price - current_price) / current_price * 100, 1)
                if current_price
                else 0.0
            )

            return render_template(
                "result.html",
                commodity=commodity,
                district=district,
                market=market,
                month_name=MONTH_NAMES[month - 1],
                current_year=current_year,
                future_year=future_year,
                current_price=current_price,
                future_price=future_price,
                change_pct=change_pct,
            )
        except Exception as exc:  # pragma: no cover - surfaced to the user
            context["error"] = f"Couldn't run that prediction: {exc}"

    return render_template("predict.html", **context)


@app.route("/recommend")
def recommend():
    recs = FORECAST_DATA["recommendations"]
    return render_template("recommend.html", recs=recs, top_pick=recs[0])


@app.route("/help")
def help_page():
    return render_template("help.html")


if __name__ == "__main__":
    app.run(debug=True, port=5000)
