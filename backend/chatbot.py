# chatbot.py
"""
AI Chatbot Assistant for NutriGuide AI
Integrates with Google Gemini API and features a local rule-based fallback system.
"""

import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load env variables
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Safety Disclaimer
DISCLAIMER = (
    "\n\n*Disclaimer: This app provides general nutrition guidance only. "
    "It is not a replacement for professional medical advice. For diabetes, "
    "pregnancy, kidney disease, eating disorders, or serious health conditions, "
    "consult a qualified doctor or dietitian.*"
)

# System Prompt to instruct the AI Model
SYSTEM_INSTRUCTION = (
    "You are NutriGuide AI, a helpful, friendly, and expert nutrition assistant. "
    "Your focus is to help users understand healthy eating, calories, macronutrients (protein, carbs, fats), "
    "and water intake within the context of Indian foods (like Roti, Dal, Paneer, Chana, Oats, etc.).\n\n"
    "Strict Rules:\n"
    "1. Always keep responses scientific, encouraging, and easy to understand.\n"
    "2. If a user asks about medical risks (diabetes, kidney disease, thyroid, pregnancy, blood pressure), "
    "provide helpful generic info but strongly advise them to consult a qualified doctor or dietitian.\n"
    "3. Never diagnose diseases or prescribe medications.\n"
    "4. Highlight and focus on Indian food suggestions (e.g. suggests roasted chana for snacks, paneer/soy/chicken for protein).\n"
    "5. If the user asks for nutritional advice but hasn't provided basic details (like age, gender, goal), "
    "kindly ask them to complete their profile in the Profile tab for a highly personalized calculation.\n"
    "6. At the end of medical-related questions, remind them of the medical disclaimer."
)

# Configure Gemini Client if key exists
model = None
if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        # Using the standard gemini-1.5-flash model
        model = genai.GenerativeModel(
            model_name='gemini-1.5-flash',
            system_instruction=SYSTEM_INSTRUCTION
        )
        print("Gemini AI Chatbot configured successfully.")
    except Exception as e:
        print(f"Error configuring Gemini API. Falling back to local assistant mode. Error: {e}")
        model = None
else:
    print("GEMINI_API_KEY not found in environment. Running chatbot in Local Fallback Mode.")


def get_local_fallback_response(user_message: str) -> str:
    """
    Provides standard high-quality nutrition responses if the Gemini API Key is not set up yet.
    Perfect for offline student demonstrations!
    """
    msg = user_message.lower()
    
    # 1. Hello / Intro
    if any(greet in msg for greet in ["hello", "hi", "hey", "who are you"]):
        return (
            "Hello! I am NutriGuide AI, your personalized nutrition assistant. "
            "I can help explain calories, macronutrients, suggest Indian foods, or answer nutrition questions. "
            "To get started, please make sure you fill out your stats in the 'Profile' section so I can see your daily targets!"
        )
    
    # 2. Calories
    elif "calorie" in msg:
        return (
            "Calories are the energy your body gets from foods and beverages. \n"
            "- To **lose weight**, you need a calorie deficit (consuming fewer calories than your body burns, e.g., TDEE - 400).\n"
            "- To **gain muscle/weight**, you need a calorie surplus (consuming more than TDEE).\n"
            "You can track your calories on our 'Meal Tracker' page!" + DISCLAIMER
        )
        
    # 3. Protein
    elif "protein" in msg:
        return (
            "Protein is crucial for muscle repair, growth, and cellular health. "
            "Good Indian protein sources include:\n"
            "- **Vegetarian/Vegan**: Soy chunks, Paneer, Tofu, Moong sprouts, Rajma, Dal, and Peanuts.\n"
            "- **Egg/Non-Veg**: Whole eggs, Egg whites, Chicken breast, and Rohu/Surmai Fish.\n"
            "- Gym users typically require a higher target (1.4g to 1.8g per kg body weight)." + DISCLAIMER
        )

    # 4. Carbs / Fats
    elif any(term in msg for term in ["carb", "fat", "lipid", "sugar"]):
        return (
            "Carbohydrates are your body's primary energy source. Choose complex carbs like oats, brown rice, whole wheat roti, and millets (Ragi, Bajra) over refined flour and white sugar.\n"
            "Fats are essential for hormone production and vitamin absorption. Incorporate healthy fats like almonds, walnuts, seeds, and moderate amounts of ghee or mustard oil." + DISCLAIMER
        )

    # 5. Kidney disease safety check
    elif "kidney" in msg:
        return (
            "⚠️ Safety Notice: If you have kidney disease, high-protein intake can put stress on your kidneys. "
            "Please consult a nephrologist. Your daily protein target in the profile is capped at 0.8g/kg for safety." + DISCLAIMER
        )

    # 6. Diabetes check
    elif "diabet" in msg or "sugar level" in msg:
        return (
            "⚠️ Safety Notice: For diabetes, avoid refined sugar, honey, white bread, and high-glycemic foods. "
            "Focus on complex carbs, dietary fiber (like oats, vegetables, sprouts), and lean proteins. "
            "Always align your meals with your physician's advice and medication." + DISCLAIMER
        )

    # 7. General Indian Food list
    elif any(f in msg for f in ["food", "diet plan", "what to eat", "indian option"]):
        return (
            "For a healthy Indian diet, aim for a balanced plate:\n"
            "1. **50% Vegetables & Salad** (Bhindi, Palak, cucumber, tomato)\n"
            "2. **25% Protein** (Moong Dal, Paneer, Soya chunks, Egg whites, Chicken breast)\n"
            "3. **25% Complex Carbs** (Roti, Brown rice, Oats)\n"
            "Snack on roasted chana or roasted makhana instead of fried items!" + DISCLAIMER
        )

    # Default fallback response
    return (
        "I understand you are asking about nutrition! Here are some general tips:\n"
        "- Ensure you calculate your BMI and daily targets on the **Profile** page.\n"
        "- Prioritize balanced meals with protein, fiber, and plenty of water.\n"
        "- Track what you eat in the **Meal Tracker** to see if you hit your targets.\n"
        "Please ask me specifically about calories, protein, Indian foods, or safety guidelines for detailed answers." + DISCLAIMER
    )


def ask_nutrition_chatbot(user_message: str, chat_history: list = []) -> str:
    """
    Sends message to Gemini API or routes to local fallback if API key is not configured.
    """
    if model:
        try:
            # We can format the history for Gemini
            # To keep it simple, we send the prompt to the model directly.
            # We can append history context if needed, but a single call with prompt is very stable.
            formatted_prompt = ""
            for chat in chat_history[-6:]:  # Send last 6 messages for context
                role = "User" if chat.get("sender") == "user" else "Assistant"
                formatted_prompt += f"{role}: {chat.get('text')}\n"
            formatted_prompt += f"User: {user_message}\nAssistant:"

            response = model.generate_content(formatted_prompt)
            return response.text + DISCLAIMER
        except Exception as e:
            print(f"Gemini API execution error, switching to fallback: {e}")
            return get_local_fallback_response(user_message)
    else:
        return get_local_fallback_response(user_message)
