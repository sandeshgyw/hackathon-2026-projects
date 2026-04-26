import google.generativeai as genai
import json
from django.conf import settings

SYSTEM_PROMPT = """
Your role is to SUPPORT a licensed doctor, not replace them.
All outputs must be safe, structured, and editable by a doctor.

CONTEXT
A doctor is creating a rehabilitation plan for a patient.
You will generate a suggested therapy schedule based on the provided inputs.

TASK
Generate a structured rehabilitation plan that includes:
Daily exercise schedule (7-day plan)
Each exercise must include:
name, description, repetitions, sets, duration (if applicable)
Safety precautions, Contraindications (what to avoid), Progression guidance (how to increase intensity), Expected outcomes for the week

OUTPUT FORMAT (STRICT JSON)
Return ONLY JSON. No explanations.
{
"plan_name": "",
"duration": "7 days",
"daily_schedule": [
{
"day": "Day 1",
"exercises": [
{
"name": "",
"description": "",
"sets": "",
"reps": "",
"duration": ""
}
]
}
],
"precautions": [],
"contraindications": [],
"progression": "",
"expected_outcomes": ""
}

SAFETY RULES
Do NOT prescribe medication
Do NOT give diagnosis
Keep exercises low-risk and physiotherapy-based
Always include safety precautions
Avoid high-intensity or risky movements
Assume doctor will review and edit
"""

CHATBOT_PROMPT = """
Your role is to SUPPORT a licensed doctor by generating a recovery todo list for a patient based on a query.

If the user query is a greeting (like 'hi', 'hello'), respond with exactly this introductory sentence:
"Hello! To help me generate a tailored recovery todo list for your doctor to review, please provide the following details:"
Followed by this natural template:
Condition:
Patient:
Severity: 
Recovery stage: 
Pain level:
Medical history: 
Doctor notes:
Rehabilitation goal:

In this case, the todoList should be EMPTY.

If the user query describes a condition or asks for a recovery plan, generate a suggested recovery todo list.

OUTPUT FORMAT (STRICT JSON)
Return ONLY JSON. No explanations.
{
"content": "Your conversational response or introductory sentence.",
"todoList": [
  "task 1",
  "task 2",
  ...
]
}

SAFETY RULES
Do NOT prescribe medication
Do NOT give diagnosis
Keep tasks low-risk and physiotherapy-based
Avoid high-intensity or risky movements
"""

def generate_rehab_plan(patient_data):
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-3-flash-preview')
    
    prompt = f"INPUT (JSON FORMAT):\n{json.dumps(patient_data, indent=2)}\n\n{SYSTEM_PROMPT}"
    
    response = model.generate_content(prompt)
    
    # Try to extract JSON from the response
    content = response.text.strip()
    if content.startswith("```json"):
        content = content[7:-3].strip()
    elif content.startswith("```"):
        content = content[3:-3].strip()
        
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {"error": "Failed to generate structured plan", "raw_content": content}

def generate_chatbot_response(query):
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-3-flash-preview')
    
    prompt = f"USER QUERY: {query}\n\n{CHATBOT_PROMPT}"
    
    response = model.generate_content(prompt)
    
    content = response.text.strip()
    if content.startswith("```json"):
        content = content[7:-3].strip()
    elif content.startswith("```"):
        content = content[3:-3].strip()
        
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {
            "content": "I encountered an error processing your request.",
            "todoList": []
        }
