# diet_logic.py
"""
Diet Logic Engine for NutriGuide AI
Implements standard nutritional formulas (Mifflin-St Jeor) and diet planning rules.
"""

import json
from pathlib import Path
from safety_rules import evaluate_safety_rules, filter_foods_by_allergies

# Load the food database
FOODS_DB_PATH = Path(__file__).parent / "data" / "foods.json"

def load_foods():
    try:
        with open(FOODS_DB_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading foods.json: {e}")
        return []

def calculate_health_metrics(profile: dict):
    """
    Calculates weight and health stats:
    BMI, BMR, TDEE, Calorie Targets, and Macro splits.
    """
    age = int(profile.get("age", 25))
    gender = profile.get("gender", "male").lower()
    height = float(profile.get("height", 170.0)) # cm
    weight = float(profile.get("weight", 60.0)) # kg
    goal = profile.get("goal", "maintenance").lower()
    activity_level = profile.get("activity_level", "sedentary").lower()
    gym_status = profile.get("gym_status", "non-gym").lower() == "gym user"

    # 1. BMI Calculation
    height_in_meters = height / 100.0
    bmi = weight / (height_in_meters ** 2)
    
    if bmi < 18.5:
        bmi_category = "Underweight"
    elif 18.5 <= bmi < 25.0:
        bmi_category = "Normal Weight"
    elif 25.0 <= bmi < 30.0:
        bmi_category = "Overweight"
    else:
        bmi_category = "Obese"

    # 2. BMR (Mifflin-St Jeor Equation)
    if gender == "male":
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5
    else:
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161

    # 3. TDEE (Activity Multiplier)
    activity_multipliers = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725
    }
    multiplier = activity_multipliers.get(activity_level, 1.2)
    tdee = bmr * multiplier

    # 4. Calorie Target by Goal
    if goal == "weight_loss":
        calorie_target = tdee - 400  # standard safe deficit
    elif goal == "muscle_gain":
        calorie_target = tdee + 300  # moderate lean surplus
    elif goal == "weight_gain":
        calorie_target = tdee + 450  # weight gain surplus
    else: # maintenance
        calorie_target = tdee

    # 5. Protein Target (g)
    # normal: 0.9g/kg, gym: 1.6g/kg
    if gym_status:
        protein_target = weight * 1.6
    else:
        protein_target = weight * 0.9

    # Apply Safety Overrides (Kidney disease caps, BMI warnings)
    safety_results = evaluate_safety_rules(profile, bmi, protein_target, calorie_target)
    
    # Overwrite if safety rule triggered an override
    if safety_results["adjusted_calories"] == "override_to_maintenance":
        calorie_target = tdee
    else:
        calorie_target = safety_results["adjusted_calories"]

    protein_target = safety_results["adjusted_protein"]

    # 6. Fat Target (25% of calories)
    # 1g fat = 9 kcal
    fat_target = (calorie_target * 0.25) / 9

    # 7. Carb Target (Remaining calories)
    # 1g carb = 4 kcal
    carb_calories = calorie_target - (protein_target * 4) - (fat_target * 9)
    # Safeguard against negative values
    carb_target = max(carb_calories / 4, 50.0)

    # 8. Water Intake (Liters)
    # 35ml per kg base + 0.5L for active
    water_target = (weight * 0.035)
    if activity_level in ["moderate", "active"] or gym_status:
        water_target += 0.6
    # Keep water target between 2L and 5L safely
    water_target = round(max(min(water_target, 5.0), 2.0), 1)

    return {
        "bmi": round(bmi, 1),
        "bmi_category": bmi_category,
        "bmr": round(bmr, 0),
        "tdee": round(tdee, 0),
        "calorie_target": round(calorie_target, 0),
        "protein_target": round(protein_target, 1),
        "carb_target": round(carb_target, 1),
        "fat_target": round(fat_target, 1),
        "water_target": water_target,
        "warnings": safety_results["warnings"]
    }

def generate_diet_plan(profile: dict):
    """
    Compiles a meal plan based on food preference, budget, allergies, gym status, and medical constraints.
    """
    # 1. Get targets
    metrics = calculate_health_metrics(profile)
    calorie_target = metrics["calorie_target"]
    
    # 2. Load and filter foods
    foods = load_foods()
    
    # Filter by allergies
    foods = filter_foods_by_allergies(foods, profile.get("allergies", []))
    
    # Filter by food preference
    pref = profile.get("food_preference", "vegetarian").lower()
    # Food types allowed:
    # vegan -> vegan
    # vegetarian -> veg, vegan
    # eggitarian -> veg, vegan, egg
    # non-vegetarian -> veg, vegan, egg, non-veg
    allowed_types = ["veg", "vegan"]
    if pref == "vegan":
        allowed_types = ["vegan"]
    elif pref == "eggitarian":
        allowed_types = ["veg", "vegan", "egg"]
    elif pref == "non-vegetarian":
        allowed_types = ["veg", "vegan", "egg", "non-veg"]
        
    foods = [f for f in foods if f["food_type"] in allowed_types]

    # Filter by budget
    budget = profile.get("budget", "medium").lower()
    # budget categories: low, medium, high
    # low budget -> only low
    # medium budget -> low, medium
    # high budget -> low, medium, high
    allowed_budgets = ["low"]
    if budget == "medium":
        allowed_budgets = ["low", "medium"]
    elif budget == "high":
        allowed_budgets = ["low", "medium", "high"]
        
    foods = [f for f in foods if f["budget_category"] in allowed_budgets]

    # Helper function to find a food item by name or tags safely
    def find_food(names):
        for name in names:
            for f in foods:
                if name.lower() in f["name"].lower():
                    return f
        # Fallback to any food in the list if none matches
        return foods[0] if foods else {
            "name": "Mixed Salad", "serving_size": "1 bowl", "calories": 50,
            "protein": 1.0, "carbs": 10.0, "fat": 0.2, "fiber": 2.0
        }

    gym_status = profile.get("gym_status", "non-gym").lower() == "gym user"

    # Meal portions division of calorie target:
    # We select standard dishes and calculate servings to hit the calorie goals
    plan = {
        "breakfast": [],
        "mid_morning": [],
        "lunch": [],
        "evening_snack": [],
        "dinner": [],
        "pre_workout": [],
        "post_workout": []
    }

    # Compile Breakfast
    # Vegans: Oats / Poha / Idli. Eggs: Omelette / Eggs.
    if pref in ["eggitarian", "non-vegetarian"]:
        f_egg = find_food(["omelette", "boiled egg", "egg bhurji"])
        f_carb = find_food(["roti", "poha", "oats", "idli"])
        plan["breakfast"].append({"food": f_egg, "servings": 1.0})
        plan["breakfast"].append({"food": f_carb, "servings": 1.5})
    else:
        f_carb = find_food(["poha", "upma", "oats", "idli"])
        f_milk = find_food(["double toned milk", "tofu", "curd"])
        plan["breakfast"].append({"food": f_carb, "servings": 1.5})
        plan["breakfast"].append({"food": f_milk, "servings": 1.0})

    # Compile Mid-Morning
    f_fruit = find_food(["apple", "banana", "guava", "papaya"])
    plan["mid_morning"].append({"food": f_fruit, "servings": 1.0})

    # Compile Lunch
    # Carb (Rice/Roti) + Dal + Veg Sabzi
    f_carb_l = find_food(["brown rice", "white basmati rice", "roti"])
    f_dal_l = find_food(["moong dal", "masoor dal", "toor dal", "chana masala"])
    f_veg_l = find_food(["mixed vegetable sabzi", "bhindi", "cucumber tomato salad"])
    plan["lunch"].append({"food": f_carb_l, "servings": 2.0})
    plan["lunch"].append({"food": f_dal_l, "servings": 1.0})
    plan["lunch"].append({"food": f_veg_l, "servings": 1.0})

    # Add extra protein source to lunch for muscle building or gym users
    if gym_status or profile.get("goal") == "muscle_gain":
        f_protein_l = find_food(["paneer", "chicken breast", "tofu", "soy chunks"])
        plan["lunch"].append({"food": f_protein_l, "servings": 0.5})

    # Compile Evening Snack
    f_snack = find_food(["roasted chana", "roasted makhana", "peanuts"])
    plan["evening_snack"].append({"food": f_snack, "servings": 1.0})

    # Compile Dinner
    # Roti/Rice + Light Dal/Paneer/Chicken/Fish + Salad
    f_carb_d = find_food(["roti", "ragi roti", "bajra roti"])
    if pref == "non-vegetarian":
        f_prot_d = find_food(["fish curry", "chicken curry", "boiled egg"])
    else:
        f_prot_d = find_food(["paneer", "tofu", "soy chunks", "moong dal"])
    f_salad = find_food(["cucumber tomato salad"])
    
    plan["dinner"].append({"food": f_carb_d, "servings": 1.5})
    plan["dinner"].append({"food": f_prot_d, "servings": 1.0})
    plan["dinner"].append({"food": f_salad, "servings": 1.0})

    # Pre & Post Workouts (Only for Gym Users)
    if gym_status:
        # Pre-workout: Fast carbs
        f_pre = find_food(["banana", "sweet potato"])
        plan["pre_workout"].append({"food": f_pre, "servings": 1.0})
        
        # Post-workout: High protein
        f_post = find_food(["whey protein", "egg white", "soy chunks", "tofu"])
        plan["post_workout"].append({"food": f_post, "servings": 1.0})
    else:
        # Empty arrays for non-gym users
        plan["pre_workout"] = []
        plan["post_workout"] = []

    # Calculate actual nutrition of compilation
    totals = {"calories": 0.0, "protein": 0.0, "carbs": 0.0, "fat": 0.0, "fiber": 0.0}
    for meal, items in plan.items():
        for item in items:
            serv = item["servings"]
            f = item["food"]
            totals["calories"] += f.get("calories", 0) * serv
            totals["protein"] += f.get("protein", 0) * serv
            totals["carbs"] += f.get("carbs", 0) * serv
            totals["fat"] += f.get("fat", 0) * serv
            totals["fiber"] += f.get("fiber", 0) * serv

    # Portion scaling to align closer to targets
    scale_factor = calorie_target / max(totals["calories"], 100)
    
    # Cap scaling to logical values to avoid food portions being absurd
    scale_factor = max(min(scale_factor, 1.8), 0.6)

    # Re-apply scale factor and round portions to 1 decimal place
    final_meals = {}
    for meal, items in plan.items():
        meal_list = []
        for item in items:
            adjusted_serv = round(item["servings"] * scale_factor, 1)
            # Prevent 0 servings
            if adjusted_serv == 0:
                adjusted_serv = 0.5
            meal_list.append({
                "food_name": item["food"]["name"],
                "base_serving": item["food"]["serving_size"],
                "servings": adjusted_serv,
                "calories": round(item["food"]["calories"] * adjusted_serv, 0),
                "protein": round(item["food"]["protein"] * adjusted_serv, 1),
                "carbs": round(item["food"]["carbs"] * adjusted_serv, 1),
                "fat": round(item["food"]["fat"] * adjusted_serv, 1)
            })
        final_meals[meal] = meal_list

    # Re-calculate totals
    final_totals = {"calories": 0.0, "protein": 0.0, "carbs": 0.0, "fat": 0.0}
    for meal, items in final_meals.items():
        for item in items:
            final_totals["calories"] += item["calories"]
            final_totals["protein"] += item["protein"]
            final_totals["carbs"] += item["carbs"]
            final_totals["fat"] += item["fat"]

    for k in final_totals:
        final_totals[k] = round(final_totals[k], 1)

    return {
        "targets": metrics,
        "meals": final_meals,
        "totals": final_totals
    }
