from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pandas as pd
import pickle
import os
import traceback

app = FastAPI(title="Bank Term Deposit Predictor API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows your deployed frontend to make requests
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "../Outputs/best_catboost.pkl")

try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    print("Model loaded successfully from Outputs folder!")
except Exception as e:
    print(f"Error loading model: {e}")

class PredictionRequest(BaseModel):
    age: int = Field(..., ge=18, le=100)
    balance: float
    campaign: int = Field(..., ge=1)
    previous: int = Field(..., ge=0)
    day: int = Field(..., ge=1, le=31)
    housing_yes: int = Field(..., ge=0, le=1)
    contact_unknown: int = Field(..., ge=0, le=1)
    poutcome_success: int = Field(..., ge=0, le=1)
    month_target_enc: float

@app.post("/predict")
def predict_conversion(data: PredictionRequest):
    try:
        input_df = pd.DataFrame([{
            'age': data.age,
            'balance': data.balance,
            'campaign': data.campaign,
            'previous': data.previous,
            'day': data.day,
            'housing_yes': data.housing_yes,
            'contact_unknown': data.contact_unknown,
            'poutcome_success': data.poutcome_success,
            'month_target_enc': data.month_target_enc
        }])
        
        probabilities = model.predict_proba(input_df)
        conversion_probability = float(probabilities[0][1])
        
        return {
            "conversion_probability": round(conversion_probability, 4)
        }
    except Exception as e:
        # This will print the full traceback in your uvicorn terminal
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))