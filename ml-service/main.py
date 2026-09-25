import os
import json
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from predict import predict_calorie_requirement, get_model_and_metadata
from train import train_model

app = FastAPI(
    title="FitAI Machine Learning Calorie Prediction Service",
    description="Dedicated Machine Learning regression service using a trained Random Forest Regressor for individualized caloric and macronutrient predictions.",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CaloriePredictionRequest(BaseModel):
    age: int = Field(21, ge=12, le=100, description="Age in years")
    gender: str = Field("male", description="Gender ('male' or 'female')")
    height: float = Field(175.0, ge=100.0, le=250.0, description="Height in cm")
    weight: float = Field(72.0, ge=30.0, le=250.0, description="Weight in kg")
    activity_level: str = Field("moderate", description="sedentary, light, moderate, active, very_active")
    goal: str = Field("lose", description="lose, maintain, gain, build_muscle")
    exercise_frequency: Optional[int] = Field(4, ge=0, le=7, description="Workouts per week")

@app.on_event("startup")
async def startup_event():
    print("[ML Service] Initializing Random Forest model and metadata in memory...")
    try:
        get_model_and_metadata()
        print("[ML Service] Model initialized successfully!")
    except Exception as e:
        print(f"[ML Service] Startup warning: {e}")

@app.get("/")
def root():
    return {
        "service": "FitAI ML Service",
        "model": "RandomForestRegressor (30-tree Ensemble)",
        "status": "online",
        "endpoints": ["/predict", "/model-info", "/health", "/retrain"]
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "FitAI Machine Learning",
        "model": "RandomForestRegressor"
    }

@app.get("/model-info")
def get_model_info():
    try:
        _, metadata = get_model_and_metadata()
        return metadata
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch model info: {str(e)}")

@app.post("/predict")
def predict(payload: CaloriePredictionRequest):
    try:
        result = predict_calorie_requirement(payload.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/retrain")
def retrain():
    try:
        metadata = train_model()
        import predict
        predict.MODEL = None
        predict.METADATA = None
        get_model_and_metadata()
        return {
            "status": "success",
            "message": "Model retrained and reloaded successfully",
            "metadata": metadata
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retraining failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
