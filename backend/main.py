# main.py
"""
NutriGuide AI - FastAPI Backend API Server
Provides endpoints for health calculations, diet planning, meal logging, and AI assistant chat.
Stores data in local JSON files inside the data/ directory.
"""

import os
import json
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pathlib import Path

# Import custom nutrition modules
from diet_logic import calculate_health_metrics, generate_diet_plan, load_foods
from chatbot import ask_nutrition_chatbot

app = FastAPI(
    title="NutriGuide AI Backend",
    description="Backend API for Personalized Diet Planning and Nutrition Assistant App",
    version="1.0.0"
)

# Enable CORS for the React frontend (running on Vite, usually port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths for local file database
DATA_DIR = Path(__file__).parent / "data"
PROFILE_FILE = DATA_DIR / "profile.json"
MEAL_LOGS_FILE = DATA_DIR / "meal_logs.json"

# Ensure data directory exists
DATA_DIR.mkdir(exist_ok=True)

# ----------------- PYDANTIC SCHEMAS (Request/Response Models) -----------------

class ProfileSchema(BaseModel):
    name: str = Field(..., example="Amit Sharma")
    age: int = Field(..., ge=1, le=120, example=22)
    gender: str = Field(..., example="male", description="male, female, or other")
    height: float = Field(..., ge=50.0, le=250.0, example=175.5, description="Height in cm")
    weight: float = Field(..., ge=10.0, le=300.0, example=70.0, description="Weight in kg")
    goal: str = Field(..., example="muscle_gain", description="weight_loss, weight_gain, muscle_gain, maintenance")
    activity_level: str = Field(..., example="moderate", description="sedentary, light, moderate, active")
    food_preference: str = Field(..., example="vegetarian", description="vegetarian, non-vegetarian, eggitarian, vegan")
    budget: str = Field(..., example="medium", description="low, medium, high")
    medical_conditions: List[str] = Field(default=[], example=["none"], description="diabetes, blood pressure, thyroid, kidney disease, acidity, none")
    allergies: List[str] = Field(default=[], example=["nuts"], description="milk, nuts, gluten, eggs, none")
    gym_status: str = Field(..., example="gym user", description="gym user or non-gym user")
    is_pregnant: Optional[bool] = Field(default=False, example=False)

class MealLogSchema(BaseModel):
    food_name: str = Field(..., example="Whole Wheat Roti")
    servings: float = Field(..., ge=0.1, example=2.0)
    calories: float = Field(..., example=170.0)
    protein: float = Field(..., example=6.0)
    carbs: float = Field(..., example=36.0)
    fat: float = Field(..., example=1.0)
    meal_type: str = Field(..., example="lunch", description="breakfast, mid_morning, lunch, evening_snack, dinner, pre_workout, post_workout")

class ChatRequestSchema(BaseModel):
    message: str = Field(..., example="What are some high-protein veg snacks?")
    history: List[dict] = Field(default=[], example=[{"sender": "user", "text": "Hi"}, {"sender": "bot", "text": "Hello!"}])

# ----------------- DATABASE UTILS (JSON files) -----------------

def save_profile_to_db(profile: dict):
    with open(PROFILE_FILE, "w", encoding="utf-8") as f:
        json.dump(profile, f, indent=2)

def load_profile_from_db() -> Optional[dict]:
    if not PROFILE_FILE.exists():
        return None
    try:
        with open(PROFILE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None

def save_meal_logs_to_db(logs: list):
    with open(MEAL_LOGS_FILE, "w", encoding="utf-8") as f:
        json.dump(logs, f, indent=2)

def load_meal_logs_from_db() -> list:
    if not MEAL_LOGS_FILE.exists():
        return []
    try:
        with open(MEAL_LOGS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

# ----------------- API ENDPOINTS -----------------

@app.get("/")
def read_root():
    return {"message": "Welcome to NutriGuide AI API Server!"}


@app.post("/profile", summary="Save user profile details")
def save_profile(profile: ProfileSchema):
    """
    Saves the user profile to profile.json and runs calculations.
    
    **Sample Request:**
    ```json
    {
      "name": "Amit Sharma",
      "age": 22,
      "gender": "male",
      "height": 175,
      "weight": 70,
      "goal": "muscle_gain",
      "activity_level": "moderate",
      "food_preference": "vegetarian",
      "budget": "medium",
      "medical_conditions": ["none"],
      "allergies": ["none"],
      "gym_status": "gym user",
      "is_pregnant": false
    }
    ```
    
    **Sample Response:**
    ```json
    {
      "status": "success",
      "message": "Profile saved successfully!",
      "profile": {...}
    }
    ```
    """
    profile_dict = profile.model_dump()
    save_profile_to_db(profile_dict)
    return {
        "status": "success",
        "message": "Profile saved successfully!",
        "profile": profile_dict
    }


@app.get("/profile", summary="Get current user profile")
def get_profile():
    """
    Returns the saved user profile from profile.json.
    """
    profile = load_profile_from_db()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Please create one first.")
    return profile


@app.post("/calculate-health", summary="Calculate BMR, BMI, and calorie/macro targets")
def calculate_health(profile: ProfileSchema):
    """
    Performs nutritional calculations based on Mifflin-St Jeor and WHO rules.
    Includes active medical warnings and safety modifications.

    **Sample Request:**
    ```json
    {
      "name": "Priya",
      "age": 25,
      "gender": "female",
      "height": 160.0,
      "weight": 52.0,
      "goal": "weight_loss",
      "activity_level": "sedentary",
      "food_preference": "vegan",
      "budget": "low",
      "medical_conditions": ["acidity"],
      "allergies": ["none"],
      "gym_status": "non-gym",
      "is_pregnant": false
    }
    ```

    **Sample Response:**
    ```json
    {
      "bmi": 20.3,
      "bmi_category": "Normal Weight",
      "bmr": 1229.0,
      "tdee": 1475.0,
      "calorie_target": 1075.0,
      "protein_target": 46.8,
      "carb_target": 154.5,
      "fat_target": 29.9,
      "water_target": 2.0,
      "warnings": [
        "⚠️ Acidity/GERD detected: Avoid highly spicy, deep-fried foods, caffeine..."
      ]
    }
    ```
    """
    try:
        metrics = calculate_health_metrics(profile.model_dump())
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation error: {str(e)}")


@app.post("/generate-diet-plan", summary="Generate a customized daily Indian diet plan")
def generate_diet(profile: ProfileSchema):
    """
    Generates structured meal plan arrays (Breakfast, Lunch, Dinner, etc.) 
    with tailored Indian food choices based on profile, allergies, and budget.

    **Sample Request:** (Same as ProfileSchema)

    **Sample Response:**
    ```json
    {
      "targets": { "calorie_target": 2100, "protein_target": 112, ... },
      "meals": {
        "breakfast": [
          {
            "food_name": "Rolled Oats",
            "base_serving": "1 bowl (40g dry)",
            "servings": 1.5,
            "calories": 228.0,
            "protein": 8.3,
            "carbs": 40.5,
            "fat": 4.2
          }
        ],
        ...
      },
      "totals": { "calories": 2085.0, "protein": 110.5, "carbs": 242.0, "fat": 58.0 }
    }
    ```
    """
    try:
        plan = generate_diet_plan(profile.model_dump())
        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Diet compilation error: {str(e)}")


@app.get("/foods", summary="Fetch list of Indian foods")
def get_foods():
    """
    Returns the complete list of 50+ Indian foods from foods.json.
    Used by the front-end to populate meal selection trackers.
    """
    return load_foods()


@app.post("/meal-log", summary="Log food eaten")
def log_meal(meal: MealLogSchema):
    """
    Logs an item eaten today. Saved locally to meal_logs.json.

    **Sample Request:**
    ```json
    {
      "food_name": "Whole Wheat Roti",
      "servings": 2.0,
      "calories": 170.0,
      "protein": 6.0,
      "carbs": 36.0,
      "fat": 1.0,
      "meal_type": "lunch"
    }
    ```

    **Sample Response:**
    ```json
    {
      "status": "success",
      "message": "Meal logged successfully!",
      "logs": [...]
    }
    ```
    """
    logs = load_meal_logs_from_db()
    logs.append(meal.model_dump())
    save_meal_logs_to_db(logs)
    return {
        "status": "success",
        "message": "Meal logged successfully!",
        "logs": logs
    }


@app.get("/meal-log", summary="Get today's logged meals")
def get_meal_logs():
    """
    Returns today's logged meals from meal_logs.json.
    """
    return load_meal_logs_from_db()


@app.delete("/meal-log", summary="Clear meal logs")
def clear_meal_logs():
    """
    Deletes all records from meal_logs.json. Useful to reset for a new day.
    """
    save_meal_logs_to_db([])
    return {"status": "success", "message": "Meal logs cleared successfully!"}


@app.get("/dashboard", summary="Aggregate stats for Dashboard page")
def get_dashboard():
    """
    Aggregates targets and logs. Calculates diet score and remaining values.

    **Sample Response:**
    ```json
    {
      "bmi": 22.8,
      "calorie_target": 2050,
      "protein_target": 63.0,
      "water_target": 3.0,
      "calories_consumed": 350.0,
      "protein_consumed": 15.0,
      "calories_remaining": 1700.0,
      "protein_remaining": 48.0,
      "diet_score": 85,
      "logged_meals": [...]
    }
    ```
    """
    profile = load_profile_from_db()
    if not profile:
        # Return default zeroed stats if no profile exists
        return {
            "bmi": 0.0,
            "calorie_target": 2000.0,
            "protein_target": 60.0,
            "water_target": 2.5,
            "calories_consumed": 0.0,
            "protein_consumed": 0.0,
            "calories_remaining": 2000.0,
            "protein_remaining": 60.0,
            "diet_score": 0,
            "logged_meals": []
        }

    # Recalculate targets based on profile
    metrics = calculate_health_metrics(profile)
    calorie_target = metrics["calorie_target"]
    protein_target = metrics["protein_target"]
    water_target = metrics["water_target"]
    bmi = metrics["bmi"]

    # Sum consumed calories
    logs = load_meal_logs_from_db()
    cal_consumed = sum(item.get("calories", 0.0) for item in logs)
    prot_consumed = sum(item.get("protein", 0.0) for item in logs)

    cal_remaining = max(calorie_target - cal_consumed, 0.0)
    prot_remaining = max(protein_target - prot_consumed, 0.0)

    # Simple Diet Score calculation algorithm (0 - 100)
    # 50 points based on calorie target matching (highest points for being within 10% target)
    # 50 points based on protein target matching
    score_cal = 0
    if calorie_target > 0:
        pct_cal = (cal_consumed / calorie_target) * 100
        if 90 <= pct_cal <= 110:
            score_cal = 50
        elif pct_cal < 90:
            score_cal = int((pct_cal / 90) * 50)
        else:  # went over target
            diff = pct_cal - 110
            score_cal = max(50 - int(diff), 0)

    score_prot = 0
    if protein_target > 0:
        pct_prot = (prot_consumed / protein_target) * 100
        if 90 <= pct_prot <= 120:
            score_prot = 50
        elif pct_prot < 90:
            score_prot = int((pct_prot / 90) * 50)
        else:
            diff = pct_prot - 120
            score_prot = max(50 - int(diff), 0)

    diet_score = score_cal + score_prot

    # If no logs yet, make score 0 or a base starting value
    if not logs:
        diet_score = 0

    return {
        "bmi": bmi,
        "calorie_target": calorie_target,
        "protein_target": protein_target,
        "water_target": water_target,
        "calories_consumed": round(cal_consumed, 1),
        "protein_consumed": round(prot_consumed, 1),
        "calories_remaining": round(cal_remaining, 1),
        "protein_remaining": round(prot_remaining, 1),
        "diet_score": diet_score,
        "logged_meals": logs
    }


@app.post("/chatbot", summary="Chat with AI Nutrition Assistant")
def chatbot_chat(payload: ChatRequestSchema):
    """
    Sends message to AI Chatbot. Includes safety disclaimers.

    **Sample Request:**
    ```json
    {
      "message": "Can I eat white rice if I have diabetes?",
      "history": []
    }
    ```

    **Sample Response:**
    ```json
    {
      "response": "⚠️ Safety Notice: For diabetes, we advise limiting white basmati rice..."
    }
    ```
    """
    user_msg = payload.message
    history = payload.history
    
    bot_response = ask_nutrition_chatbot(user_msg, history)
    
    return {"response": bot_response}
