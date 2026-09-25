import os
import json
import numpy as np

from model_engine import RandomForestRegressorCustom

MODEL = None
METADATA = None

NUMERICAL_COLS = ['age', 'height', 'weight', 'bmi', 'exercise_frequency']
CATEGORICAL_MAPS = {
    'gender': ['male', 'female'],
    'activity_level': ['sedentary', 'light', 'moderate', 'active', 'very_active'],
    'goal': ['lose', 'maintain', 'gain', 'build_muscle']
}

def get_model_and_metadata():
    global MODEL, METADATA
    if MODEL is None or METADATA is None:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        model_json_path = os.path.join(base_dir, 'models', 'calorie_model.json')
        metadata_path = os.path.join(base_dir, 'models', 'model_metadata.json')

        if not os.path.exists(model_json_path) or not os.path.exists(metadata_path):
            from train import train_model
            train_model()

        with open(model_json_path, 'r', encoding='utf-8') as f:
            model_data = json.load(f)
            MODEL = RandomForestRegressorCustom.from_dict(model_data)

        with open(metadata_path, 'r', encoding='utf-8') as f:
            METADATA = json.load(f)

    return MODEL, METADATA

def normalize_goal(goal_str: str) -> str:
    g = str(goal_str).lower().replace(" ", "_").replace("-", "_")
    if "lose" in g or "cut" in g:
        return "lose"
    elif "gain" in g:
        return "gain"
    elif "muscle" in g or "bulk" in g:
        return "build_muscle"
    return "maintain"

def normalize_activity(act_str: str) -> str:
    a = str(act_str).lower().replace(" ", "_").replace("-", "_")
    if "sedentary" in a:
        return "sedentary"
    elif "light" in a:
        return "light"
    elif "active" in a:
        if "very" in a:
            return "very_active"
        return "active"
    return "moderate"

def get_bmi_category(bmi: float) -> str:
    if bmi < 18.5:
        return "Underweight"
    elif bmi < 25.0:
        return "Normal weight"
    elif bmi < 30.0:
        return "Overweight"
    else:
        return "Obese"

def predict_calorie_requirement(data: dict) -> dict:
    model, metadata = get_model_and_metadata()

    age = int(data.get("age", 21))
    gender = str(data.get("gender", "male")).lower()
    if gender not in ["male", "female"]:
        gender = "male"
    
    height = float(data.get("height", 175.0))
    weight = float(data.get("weight", 72.0))
    activity_level = normalize_activity(data.get("activity_level", "moderate"))
    goal = normalize_goal(data.get("goal", "lose"))
    
    # Calculate BMI if needed
    bmi = float(data.get("bmi", round(weight / ((height / 100.0) ** 2), 2)))
    exercise_frequency = int(data.get("exercise_frequency", 4))

    # Vectorize input
    num_vals = [float(age), float(height), float(weight), float(bmi), float(exercise_frequency)]
    gender_oh = [1.0 if gender == cat else 0.0 for cat in CATEGORICAL_MAPS['gender']]
    act_oh = [1.0 if activity_level == cat else 0.0 for cat in CATEGORICAL_MAPS['activity_level']]
    goal_oh = [1.0 if goal == cat else 0.0 for cat in CATEGORICAL_MAPS['goal']]

    raw_vector = np.array(num_vals + gender_oh + act_oh + goal_oh, dtype=np.float64)

    # Scale numeric portion using saved training scaler
    means = np.array(metadata["scaler"]["means"], dtype=np.float64)
    stds = np.array(metadata["scaler"]["stds"], dtype=np.float64)
    
    scaled_vector = raw_vector.copy()
    scaled_vector[:len(num_vals)] = (scaled_vector[:len(num_vals)] - means) / stds

    # Predict via Random Forest Regressor
    pred_val = float(model.predict(np.array([scaled_vector]))[0])
    predicted_calories = int(round(pred_val))

    # Macronutrient breakdown
    if goal in ["build_muscle", "gain"]:
        protein_g = int(round(weight * 2.0))
    else:
        protein_g = int(round(weight * 1.6))
    
    fat_g = int(round((predicted_calories * 0.25) / 9))
    remaining_kcal = predicted_calories - (protein_g * 4 + fat_g * 9)
    carbs_g = max(50, int(round(remaining_kcal / 4)))

    mae = metadata.get("metrics", {}).get("mae", 98.25)
    r2 = metadata.get("metrics", {}).get("r2_score", 0.9553)

    return {
        "predicted_calories": predicted_calories,
        "confidence_or_error_metric": f"±{mae} kcal (MAE)",
        "mae": mae,
        "r2_score": r2,
        "model": "RandomForestRegressor",
        "inputs": {
            "age": age,
            "gender": gender,
            "height": height,
            "weight": weight,
            "bmi": bmi,
            "activity_level": activity_level,
            "goal": goal,
            "exercise_frequency": exercise_frequency
        },
        "biometrics": {
            "bmi": bmi,
            "category": get_bmi_category(bmi)
        },
        "macros": {
            "protein": protein_g,
            "carbs": carbs_g,
            "fats": fat_g
        },
        "recommendation": f"To achieve your goal of '{goal}', consume approximately {predicted_calories} kcal/day with {protein_g}g protein, {carbs_g}g carbs, and {fat_g}g fats."
    }

if __name__ == '__main__':
    sample = {
        "age": 21,
        "gender": "male",
        "height": 175,
        "weight": 72,
        "activity_level": "moderate",
        "goal": "lose"
    }
    res = predict_calorie_requirement(sample)
    print("Test Prediction:")
    print(json.dumps(res, indent=2))
