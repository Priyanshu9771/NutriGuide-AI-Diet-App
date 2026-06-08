# test_backend.py
"""
Verify NutriGuide AI nutrition calculations and safety rules.
Run this script locally to check formulas and results.
"""

from diet_logic import calculate_health_metrics, generate_diet_plan
import sys

# Reconfigure stdout to support emojis on Windows consoles
if sys.platform.startswith("win"):
    sys.stdout.reconfigure(encoding='utf-8')

def test_calculations():
    print("--- Running NutriGuide AI Calculations Test ---")
    
    # Test case 1: Healthy male gym user
    profile_1 = {
        "name": "Rohan",
        "age": 22,
        "gender": "male",
        "height": 175.0,
        "weight": 70.0,
        "goal": "muscle_gain",
        "activity_level": "moderate",
        "food_preference": "non-vegetarian",
        "budget": "medium",
        "medical_conditions": ["none"],
        "allergies": ["none"],
        "gym_status": "gym user",
        "is_pregnant": False
    }
    
    metrics_1 = calculate_health_metrics(profile_1)
    print(f"\nTest 1 (Healthy Male Gym User, Goal: Muscle Gain):")
    print(f"  BMI: {metrics_1['bmi']} ({metrics_1['bmi_category']})")
    print(f"  BMR: {metrics_1['bmr']} kcal")
    print(f"  TDEE: {metrics_1['tdee']} kcal")
    print(f"  Target Calories: {metrics_1['calorie_target']} kcal")
    print(f"  Protein Target: {metrics_1['protein_target']}g (Gym User: 1.6g/kg)")
    print(f"  Water Target: {metrics_1['water_target']}L")
    print(f"  Active Warnings: {metrics_1['warnings']}")

    # Test case 2: Female with kidney disease (should cap protein at 0.8g/kg)
    profile_2 = {
        "name": "Sunita",
        "age": 45,
        "gender": "female",
        "height": 155.0,
        "weight": 60.0,
        "goal": "weight_loss",
        "activity_level": "sedentary",
        "food_preference": "vegetarian",
        "budget": "low",
        "medical_conditions": ["kidney disease", "acidity"],
        "allergies": ["none"],
        "gym_status": "non-gym",
        "is_pregnant": False
    }
    
    metrics_2 = calculate_health_metrics(profile_2)
    print(f"\nTest 2 (Female, Kidney Disease + Acidity, Goal: Weight Loss):")
    print(f"  BMI: {metrics_2['bmi']} ({metrics_2['bmi_category']})")
    print(f"  Target Calories: {metrics_2['calorie_target']} kcal")
    print(f"  Protein Target (CAPPED): {metrics_2['protein_target']}g (Base was {60.0 * 0.9}g, Capped to {60.0 * 0.8}g)")
    print(f"  Active Warnings:")
    for warn in metrics_2['warnings']:
        print(f"    - {warn}")

    # Test case 3: Underweight user trying to lose weight (should override goal)
    profile_3 = {
        "name": "Karan",
        "age": 19,
        "gender": "male",
        "height": 180.0,
        "weight": 50.0,
        "goal": "weight_loss",
        "activity_level": "light",
        "food_preference": "vegan",
        "budget": "high",
        "medical_conditions": ["none"],
        "allergies": ["milk"],
        "gym_status": "non-gym",
        "is_pregnant": False
    }
    
    metrics_3 = calculate_health_metrics(profile_3)
    print(f"\nTest 3 (Underweight, BMI < 18.5, trying to lose weight):")
    print(f"  BMI: {metrics_3['bmi']} ({metrics_3['bmi_category']})")
    print(f"  Target Calories: {metrics_3['calorie_target']} kcal (Should be TDEE due to maintenance override)")
    print(f"  Active Warnings:")
    for warn in metrics_3['warnings']:
        print(f"    - {warn}")

    # Test Diet Generation for Gluten Allergy
    profile_4 = {
        "name": "Aman",
        "age": 30,
        "gender": "male",
        "height": 170.0,
        "weight": 70.0,
        "goal": "maintenance",
        "activity_level": "moderate",
        "food_preference": "vegetarian",
        "budget": "medium",
        "medical_conditions": ["none"],
        "allergies": ["gluten"],
        "gym_status": "non-gym"
    }
    plan = generate_diet_plan(profile_4)
    print(f"\nTest 4 (Gluten Allergy Diet Plan Check):")
    
    # Load foods to double-check their allergen values in DB
    from diet_logic import load_foods
    all_foods = load_foods()
    food_allergens_map = {f["name"].lower(): f.get("allergens", []) for f in all_foods}
    
    gluten_found = False
    for meal, items in plan["meals"].items():
        for item in items:
            name_lower = item["food_name"].lower()
            allergens = food_allergens_map.get(name_lower, [])
            if "gluten" in allergens:
                gluten_found = True
                print(f"  [ERROR] Found Gluten food: {item['food_name']} in {meal}")
    if not gluten_found:
        print("  [SUCCESS] No Gluten-containing items (e.g. Whole Wheat Roti, Semolina Upma, Aloo Paratha) were included in the diet plan. Safe alternatives were recommended!")

if __name__ == "__main__":
    test_calculations()
