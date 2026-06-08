# safety_rules.py
"""
Safety Rules Engine for NutriGuide AI
Contains medical safety rules based on WHO, ICMR-NIN, and FSSAI guidelines.
"""

def evaluate_safety_rules(profile: dict, bmi: float, base_protein_target: float, base_calorie_target: float):
    """
    Evaluates user profile flags and returns:
    1. A list of safety warnings.
    2. Overrides for calorie and protein targets if necessary.
    """
    warnings = []
    adjusted_protein = base_protein_target
    adjusted_calories = base_calorie_target
    medical_conditions = profile.get("medical_conditions", [])
    allergies = profile.get("allergies", [])
    goal = profile.get("goal", "maintenance")
    weight = profile.get("weight", 60.0)

    # 1. Kidney Disease Check
    if "kidney disease" in [c.lower() for c in medical_conditions]:
        # Cap protein at 0.8g per kg of body weight
        max_safe_protein = weight * 0.8
        if base_protein_target > max_safe_protein:
            adjusted_protein = max_safe_protein
            warnings.append(
                "⚠️ Kidney Disease detected: A high protein diet can strain kidney function. "
                f"Your daily protein intake has been capped at {adjusted_protein:.1f}g (0.8g/kg). "
                "Please consult a nephrologist or registered dietitian."
            )
        else:
            warnings.append(
                "⚠️ Kidney Disease detected: Ensure your protein intake remains at conservative levels "
                "and consult a medical professional before starting any diet plan."
            )

    # 2. Diabetes Check
    if "diabetes" in [c.lower() for c in medical_conditions]:
        warnings.append(
            "⚠️ Diabetes detected: Limit consumption of simple carbohydrates, high glycemic index foods "
            "(refined flour, white sugar, sweetened beverages) and focus on fiber-rich grains. "
            "Consult a diabetologist to align this diet with your insulin or medication schedule."
        )

    # 3. Pregnancy / Lactation Check
    # Although gender is female, user might specify in medical conditions
    if "pregnancy" in [c.lower() for c in medical_conditions] or profile.get("is_pregnant", False):
        warnings.append(
            "⚠️ Pregnancy/Lactation: Nutritional demands are highly specific during pregnancy. "
            "Please consult your obstetrician or a maternal nutritionist. "
            "Avoid extreme calorie deficits or intensive exercise programs."
        )

    # 4. Underweight BMI Check (< 18.5)
    if bmi < 18.5:
        warnings.append(
            "⚠️ Low BMI Alert: Your BMI indicates that you are underweight. "
            "Aggressive weight loss is restricted. We strongly recommend focusing on healthy muscle/weight gain."
        )
        if goal == "weight_loss":
            # Override deficit, force to maintenance/gain
            warnings.append(
                "🔄 Goal Override: You selected 'Weight Loss' but your BMI is underweight. "
                "We have adjusted your calories to Maintenance to prevent nutritional deficiency."
            )
            # Reset calories back to maintenance (TDEE) or slightly higher
            # We'll handle this correction in diet_logic, but let's signal it here
            adjusted_calories = "override_to_maintenance"

    # 5. Obese BMI Check (>= 30.0)
    elif bmi >= 30.0:
        warnings.append(
            "💡 High BMI Notice: Your BMI indicates obesity. We advise a gradual and steady "
            "weight loss rate (300-500 kcal deficit) rather than rapid crash diets to protect lean mass and metabolic health."
        )

    # 6. General Medical warnings
    if "blood pressure" in [c.lower() for c in medical_conditions]:
        warnings.append(
            "⚠️ High Blood Pressure detected: Limit sodium intake. Restrict processed snacks, pickles, "
            "papad, and added table salt. Prioritize potassium-rich fruits and vegetables."
        )

    if "thyroid" in [c.lower() for c in medical_conditions]:
        warnings.append(
            "⚠️ Thyroid Condition detected: For hypothyroidism, ensure proper iodine intake, "
            "and limit raw cruciferous vegetables (cabbage, broccoli) or heavy soy products."
        )

    if "acidity" in [c.lower() for c in medical_conditions]:
        warnings.append(
            "⚠️ Acidity/GERD detected: Avoid highly spicy, deep-fried foods, caffeine, and citrus fruits. "
            "Eat small, frequent meals and avoid lying down for 2 hours post-meal."
        )

    return {
        "warnings": warnings,
        "adjusted_protein": adjusted_protein,
        "adjusted_calories": adjusted_calories
    }


def filter_foods_by_allergies(foods: list, allergies: list) -> list:
    """
    Filters out food items that contain allergens listed in user profile.
    Allergens check matches milk, nuts, gluten, eggs.
    """
    if not allergies or "none" in [a.lower() for a in allergies]:
        return foods

    clean_allergies = [a.lower().strip() for a in allergies]
    filtered_foods = []

    for food in foods:
        # Check if food has any matching allergen warning
        has_allergen = False
        food_allergens = [al.lower() for al in food.get("allergens", [])]
        
        for allergy in clean_allergies:
            # Map common user allergy terms to food allergens
            # User might type 'milk' or 'dairy'
            if allergy in ["milk", "dairy"] and "milk" in food_allergens:
                has_allergen = True
            elif allergy in ["nuts", "peanuts"] and "nuts" in food_allergens:
                has_allergen = True
            elif allergy in ["gluten", "wheat"] and "gluten" in food_allergens:
                has_allergen = True
            elif allergy in ["eggs", "egg"] and "eggs" in food_allergens:
                has_allergen = True
                
        if not has_allergen:
            filtered_foods.append(food)

    return filtered_foods
