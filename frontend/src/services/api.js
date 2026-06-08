// api.js
/**
 * API Service for NutriGuide AI
 * Handles all network calls to the FastAPI backend using standard browser fetch.
 */

const API_BASE_URL = 'http://localhost:8000';

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const api = {
  // Save user profile
  async saveProfile(profileData) {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    return handleResponse(res);
  },

  // Get saved profile
  async getProfile() {
    const res = await fetch(`${API_BASE_URL}/profile`);
    return handleResponse(res);
  },

  // Calculate health metrics (BMI, BMR, TDEE, Macros)
  async calculateHealth(profileData) {
    const res = await fetch(`${API_BASE_URL}/calculate-health`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    return handleResponse(res);
  },

  // Generate Indian diet plan
  async generateDietPlan(profileData) {
    const res = await fetch(`${API_BASE_URL}/generate-diet-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    return handleResponse(res);
  },

  // Fetch all 50+ Indian foods
  async getFoods() {
    const res = await fetch(`${API_BASE_URL}/foods`);
    return handleResponse(res);
  },

  // Log a food item eaten
  async logMeal(mealData) {
    const res = await fetch(`${API_BASE_URL}/meal-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mealData),
    });
    return handleResponse(res);
  },

  // Fetch logged meals
  async getMealLogs() {
    const res = await fetch(`${API_BASE_URL}/meal-log`);
    return handleResponse(res);
  },

  // Clear logged meals
  async clearMealLogs() {
    const res = await fetch(`${API_BASE_URL}/meal-log`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Get aggregated dashboard stats (Consumed calories, remaining, score)
  async getDashboard() {
    const res = await fetch(`${API_BASE_URL}/dashboard`);
    return handleResponse(res);
  },

  // Talk to Gemini AI Chatbot
  async sendChatMessage(message, history) {
    const res = await fetch(`${API_BASE_URL}/chatbot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });
    return handleResponse(res);
  }
};
