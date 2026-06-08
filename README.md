# NutriGuide AI: Personalized Diet Planning and Nutrition Assistant App

**NutriGuide AI** is a professional, research-based full-stack web application designed for students, gym users, women, elderly adults, and general health-conscious individuals. The system calculates precise daily nutritional requirements, generates personalized Indian meal schedules based on dietary preferences and budget, logs meals to monitor progress, and integrates a safety-aware AI chatbot assistant.

---

## 🚀 Tech Stack & Architecture

* **Frontend:** React.js (Vite)
* **Backend:** Python FastAPI
* **Database:** Local JSON files (`profile.json`, `meal_logs.json`, and `foods.json` directory)
* **AI Chatbot:** Google Gemini API (`gemini-1.5-flash`) with local fallback rules
* **Charts:** Recharts (Interactive SVG charting library)

---

## 📂 Project Structure

```
NutriGuide/
├── backend/
│   ├── data/
│   │   ├── foods.json            # 52 Indian foods with macros, budget & allergens
│   │   ├── profile.json          # Cached user profile data
│   │   └── meal_logs.json        # Saved food log items
│   ├── main.py                   # FastAPI routing, schemas, and CORS config
│   ├── diet_logic.py             # BMR (Mifflin-St Jeor), TDEE and portion scales
│   ├── safety_rules.py           # Medical safety flags & allergy check
│   ├── chatbot.py                # Gemini AI connector and local fallback engine
│   ├── test_backend.py           # Python validator script for calculations
│   └── requirements.txt          # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx       # Side drawer navigator
│   │   │   ├── StatCard.jsx      # Metrics panels
│   │   │   └── SafetyWarning.jsx # Active alarms banner
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Welcome page
│   │   │   ├── Profile.jsx       # Demographics form + calculation results
│   │   │   ├── Dashboard.jsx     # Recharts logs vs goals
│   │   │   ├── DietPlan.jsx      # Tailored Indian menu planner
│   │   │   ├── MealTracker.jsx   # Searchable meal logs
│   │   │   ├── AIAssistant.jsx   # Chat interface + disclaimers
│   │   │   └── About.jsx         # Research reference slides
│   │   ├── services/
│   │   │   └── api.js            # Fetch network connector
│   │   ├── App.jsx               # Navigation route switcher
│   │   ├── main.jsx              # Mount point
│   │   └── index.css             # Glassmorphism styling tokens
│   ├── package.json              # Node dependencies
│   ├── vite.config.js            # Vite configurations
│   └── index.html                # HTML core file
│
└── README.md                     # Current documentation file
```

---

## 🛠️ Step-by-Step Setup and Execution Guide

### Prerequisites
Make sure you have the following installed on your computer:
1. **Python 3.10+** (Includes pip)
2. **Node.js 18+** (Includes npm)

---

### Step 1: Run the Backend API Server

1. Open your terminal (Command Prompt or PowerShell on Windows) and navigate to the `backend` folder:
   ```bash
   cd c:\Users\priya\Desktop\NutriGuide\backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   * **Windows (CMD):**
     ```cmd
     venv\Scripts\activate
     ```
   * **Windows (PowerShell):**
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   * **macOS/Linux:**
     ```bash
     source venv/bin/activate
     ```

4. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

5. (Optional) Configure the Gemini API key:
   * Duplicate the `.env.example` file and rename it to `.env`.
   * Open `.env` and paste your Gemini API key (from Google AI Studio):
     ```env
     GEMINI_API_KEY=your_actual_api_key_here
     ```
   * *Note: If no API key is specified, the application automatically uses a Local Fallback Chatbot mode, so you can demonstrate the project even without internet/keys!*

6. Run the FastAPI development server:
   ```bash
   uvicorn main:app --reload
   ```
   * The backend will start running on **`http://localhost:8000`**.
   * Open **`http://localhost:8000/docs`** in your browser to inspect the interactive Swagger API documentation.

---

### Step 2: Run the Frontend App

1. Open a new terminal window/tab and navigate to the `frontend` folder:
   ```bash
   cd c:\Users\priya\Desktop\NutriGuide\frontend
   ```

2. Install the frontend dependencies:
   ```bash
   npm install
   ```

3. Run the Vite React developer server:
   ```bash
   npm run dev
   ```
   * The frontend will start running on **`http://localhost:5173`**.
   * Open **`http://localhost:5173`** in your browser to view the application.

---

## 🎓 College Presentation Guide

Presenting this project successfully in front of examiners requires highlighting the **clinical research integration** and **safety guards**:

1. **Problem Statement:** Show that most generic diet planning apps recommend Western foods (avocado, salmon) that are expensive or unavailable in typical Indian households. Furthermore, general apps lack clinical safety checking (e.g. they recommend high-protein diets to users without knowing if they have chronic kidney diseases).
2. **Scientific Formulation:** Explain that calculations aren't arbitrary:
   * **BMR** uses the Mifflin-St Jeor equation (medically superior to the Harris-Benedict formula).
   * **TDEE** incorporates activity multipliers ($1.2 - 1.725$).
   * **Portion Scales** are compiled from the Indian Food Composition Tables (IFCT) under ICMR-National Institute of Nutrition (NIN) guidelines.
3. **Live Safety Demo Walkthrough:**
   * Open the **Profile Calculator** tab.
   * Input details for a female user, select **Kidney Disease**, set goal to **Muscle Gain**, and click Calculate.
   * Highlight the output screen: Point out that the protein target has been capped at $0.8\text{ g/kg}$ of body weight instead of the $1.6\text{ g/kg}$ gym target, displaying safety warning flags.
   * Change allergy to **Gluten**, generate the **Diet Plan**, and show that whole wheat roti is excluded and replaced by millet-based Bajra/Ragi Roti.
4. **Chatbot Demonstration:** Highlight that the chatbot checks for missing demographic details and incorporates strict medical disclaimers.

---

## 🔮 Future ML / Data Science Enhancements

To expand this into a major project or research paper, you can suggest these Machine Learning and Data Science integrations:

### 1. Deep Learning Food Image Recognition
* **Description:** Implement a Convolutional Neural Network (CNN) (like MobileNetV3 or ResNet50) trained on the **Food-101** dataset or custom Indian food datasets (such as IndianFoodDB).
* **Workflow:** Users upload a photo of their plate (e.g., Dal Rice). The model classifies the food item, estimates portion sizes via bounding box volumes, and automatically logs it into the **Meal Tracker**.

### 2. Deep Collaborative-Filtering Diet Recommender
* **Description:** Replace the rule-based planner with a hybrid recommendation system.
* **Workflow:** Train an algorithm using user ratings and historical logs. A user-item matrix recommends new healthy recipes that align with the user's budget and taste preferences while matching their calories.

### 3. Patient Progress & Weight Trend Prediction
* **Description:** Use Linear Regression or LSTM (Long Short-Term Memory) network models to predict weight loss timelines.
* **Workflow:** Model tracks daily logged calories and weights over time, predicting when the user will reach their target weight and warning them if their current metabolic rate indicates a plateau.

### 4. RAG-Based Nutrition Chatbot (Retrieval-Augmented Generation)
* **Description:** Enhance the chatbot using RAG.
* **Workflow:** Chunk and index official ICMR-NIN PDFs and WHO dietary textbooks in a Vector Database (like ChromaDB or Milvus). When the user asks a medical question, query the vector database and feed the exact document context to Gemini to ensure zero hallucination and 100% verified clinical references.

### 5. Barcode Scanner for Packaged Foods
* **Description:** Implement a barcode scanner using the camera (OpenCV / QuaggaJS) connected to the Open Food Facts API.
* **Workflow:** Users scan packaged items (e.g., biscuits). The app extracts active nutrition labels, reads the ingredient lists, warns them of hidden sugars, and logs it instantly.
"# NutriGuide-AI-Diet-App" 
