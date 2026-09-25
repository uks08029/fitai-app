import os
import csv
import json
import math
import datetime
import numpy as np
import joblib

from data.generate_dataset import generate_calorie_dataset
from model_engine import RandomForestRegressorCustom

CATEGORICAL_MAPS = {
    'gender': ['male', 'female'],
    'activity_level': ['sedentary', 'light', 'moderate', 'active', 'very_active'],
    'goal': ['lose', 'maintain', 'gain', 'build_muscle']
}

NUMERICAL_COLS = ['age', 'height', 'weight', 'bmi', 'exercise_frequency']

def extract_features(row):
    """Encodes a single raw row or dict into a feature vector."""
    num_vals = [float(row[col]) for col in NUMERICAL_COLS]
    
    # One-hot gender
    g = str(row.get('gender', 'male')).lower()
    gender_oh = [1.0 if g == cat else 0.0 for cat in CATEGORICAL_MAPS['gender']]

    # One-hot activity
    a = str(row.get('activity_level', 'moderate')).lower()
    act_oh = [1.0 if a == cat else 0.0 for cat in CATEGORICAL_MAPS['activity_level']]

    # One-hot goal
    gl = str(row.get('goal', 'maintain')).lower()
    goal_oh = [1.0 if gl == cat else 0.0 for cat in CATEGORICAL_MAPS['goal']]

    return num_vals + gender_oh + act_oh + goal_oh

def get_feature_names():
    names = list(NUMERICAL_COLS)
    names += [f"gender_{g}" for g in CATEGORICAL_MAPS['gender']]
    names += [f"act_{a}" for a in CATEGORICAL_MAPS['activity_level']]
    names += [f"goal_{gl}" for gl in CATEGORICAL_MAPS['goal']]
    return names

def train_model():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, 'data')
    models_dir = os.path.join(base_dir, 'models')
    os.makedirs(data_dir, exist_ok=True)
    os.makedirs(models_dir, exist_ok=True)

    csv_path = os.path.join(data_dir, 'fitness_calorie_dataset.csv')
    if not os.path.exists(csv_path):
        print("[ML Training] Dataset not found. Generating 3,000 synthetic records...")
        generate_calorie_dataset(num_samples=3000, output_path=csv_path)

    # Load dataset
    rows = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for r in reader:
            rows.append(r)

    print(f"[ML Training] Loaded {len(rows)} samples from {csv_path}")

    X_raw = np.array([extract_features(r) for r in rows], dtype=np.float64)
    y_raw = np.array([float(r['target_calories']) for r in rows], dtype=np.float64)

    # Standardization parameters for numerical features
    num_len = len(NUMERICAL_COLS)
    means = np.mean(X_raw[:, :num_len], axis=0)
    stds = np.std(X_raw[:, :num_len], axis=0)
    stds[stds == 0] = 1.0

    X_scaled = X_raw.copy()
    X_scaled[:, :num_len] = (X_scaled[:, :num_len] - means) / stds

    # Train-test split (80% train, 20% test)
    np.random.seed(42)
    indices = np.arange(len(X_scaled))
    np.random.shuffle(indices)

    split_idx = int(len(indices) * 0.8)
    train_idx, test_idx = indices[:split_idx], indices[split_idx:]

    X_train, y_train = X_scaled[train_idx], y_raw[train_idx]
    X_test, y_test = X_scaled[test_idx], y_raw[test_idx]

    print(f"[ML Training] Training RandomForestRegressor (n_estimators=30, max_depth=10)...")
    rf = RandomForestRegressorCustom(n_estimators=30, max_depth=10, min_samples_split=4, random_state=42)
    rf.fit(X_train, y_train)

    print("[ML Training] Evaluating on held-out test set...")
    y_pred = rf.predict(X_test)

    # Metrics
    mae = float(np.mean(np.abs(y_test - y_pred)))
    mse = float(np.mean((y_test - y_pred) ** 2))
    rmse = float(np.sqrt(mse))
    ss_tot = np.sum((y_test - np.mean(y_test)) ** 2)
    ss_res = np.sum((y_test - y_pred) ** 2)
    r2 = float(1.0 - (ss_res / ss_tot))

    print("==================================================")
    print("           MODEL EVALUATION RESULTS               ")
    print("==================================================")
    print(f"Algorithm:           RandomForestRegressor (Ensemble of 30 Decision Trees)")
    print(f"Training Samples:    {len(X_train)}")
    print(f"Testing Samples:     {len(X_test)}")
    print(f"Mean Absolute Error: {mae:.2f} kcal")
    print(f"Root Mean Sq Error:  {rmse:.2f} kcal")
    print(f"R² Score:            {r2:.4f} ({r2 * 100:.2f}% variance explained)")
    print("==================================================")

    feature_names = get_feature_names()
    
    # Save model json
    model_json_path = os.path.join(models_dir, 'calorie_model.json')
    with open(model_json_path, 'w', encoding='utf-8') as f:
        json.dump(rf.to_dict(), f)

    # Also save via joblib for dual compatibility
    model_joblib_path = os.path.join(models_dir, 'calorie_model.joblib')
    joblib.dump({
        "scaler": {"means": means.tolist(), "stds": stds.tolist()},
        "model_dict": rf.to_dict()
    }, model_joblib_path)

    metadata = {
        "model_name": "RandomForestRegressor",
        "algorithm": "Random Forest Regressor (Ensemble Bagging Regression)",
        "description": "Predicts personalized daily caloric requirement based on biometric, lifestyle, and goal features.",
        "trained_at": datetime.datetime.now().isoformat(),
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "features": feature_names,
        "metrics": {
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "r2_score": round(r2, 4)
        },
        "scaler": {
            "means": means.tolist(),
            "stds": stds.tolist()
        },
        "version": "1.0.0"
    }

    metadata_path = os.path.join(models_dir, 'model_metadata.json')
    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2)

    print(f"[ML Training] Model and metadata saved to {models_dir}")
    return metadata

if __name__ == '__main__':
    train_model()
