import os
import csv
import random
import math

def generate_calorie_dataset(num_samples: int = 2500, seed: int = 42, output_path: str = None) -> list:
    """
    Generates a realistic physiological dataset for training the FitAI
    calorie requirement regression model.
    Based on scientific Mifflin-St Jeor formula with real-world physiological variance.
    """
    random.seed(seed)
    
    genders = ['male', 'female']
    activity_levels = ['sedentary', 'light', 'moderate', 'active', 'very_active']
    goals = ['lose', 'maintain', 'gain', 'build_muscle']

    freq_map = {
        'sedentary': (0, 1),
        'light': (1, 3),
        'moderate': (3, 5),
        'active': (4, 6),
        'very_active': (5, 7)
    }

    act_multipliers = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'very_active': 1.9
    }

    goal_deltas = {
        'lose': -450.0,
        'maintain': 0.0,
        'gain': 350.0,
        'build_muscle': 250.0
    }

    dataset = []
    headers = ['age', 'gender', 'height', 'weight', 'bmi', 'activity_level', 'goal', 'exercise_frequency', 'target_calories']

    for _ in range(num_samples):
        gender = random.choice(genders)
        age = random.randint(18, 68)

        if gender == 'male':
            height = round(random.gauss(176, 8), 1)
            weight = round(random.gauss(76, 13), 1)
        else:
            height = round(random.gauss(163, 7), 1)
            weight = round(random.gauss(63, 11), 1)

        height = max(142.0, min(205.0, height))
        weight = max(42.0, min(140.0, weight))

        activity_level = random.choices(
            activity_levels,
            weights=[0.25, 0.30, 0.25, 0.15, 0.05],
            k=1
        )[0]

        goal = random.choices(
            goals,
            weights=[0.40, 0.25, 0.15, 0.20],
            k=1
        )[0]

        min_f, max_f = freq_map[activity_level]
        exercise_frequency = random.randint(min_f, max_f)

        bmi = round(weight / ((height / 100.0) ** 2), 2)

        # Mifflin-St Jeor formula
        if gender == 'male':
            bmr = 10 * weight + 6.25 * height - 5 * age + 5
        else:
            bmr = 10 * weight + 6.25 * height - 5 * age - 161

        tdee = bmr * act_multipliers[activity_level]
        tdee += (exercise_frequency * 35.0)

        # Goal adjustment + physiological noise
        delta = goal_deltas[goal]
        noise = random.gauss(0, 35)

        target_calories = round(max(1200.0, min(4200.0, tdee + delta + noise)))

        row = {
            'age': age,
            'gender': gender,
            'height': height,
            'weight': weight,
            'bmi': bmi,
            'activity_level': activity_level,
            'goal': goal,
            'exercise_frequency': exercise_frequency,
            'target_calories': int(target_calories)
        }
        dataset.append(row)

    if output_path:
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            writer.writeheader()
            writer.writerows(dataset)
        print(f"[Dataset Generator] Generated {len(dataset)} samples at {output_path}")

    return dataset

if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.abspath(__file__))
    out_file = os.path.join(base_dir, 'fitness_calorie_dataset.csv')
    generate_calorie_dataset(num_samples=3000, output_path=out_file)
