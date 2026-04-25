# # core/ner.py
# # Purpose: Extract medical entities from natural patient language.
# # Patients describe symptoms conversationally — not clinically.
# # We use scispaCy for accurate medical term recognition and
# # medspaCy specifically for negation detection (the one genuinely
# # useful clinical NLP feature for our use case).
# # e.g. "no fever" → fever goes to negations not symptoms
# # e.g. "chest pain" → goes to symptoms, triggers HIGH severity

import os
import logging

os.environ["LOGURU_LEVEL"] = "WARNING" # Must stay at the very top
logging.getLogger("PyRuSH").setLevel(logging.ERROR)

import medspacy
from medspacy.ner import TargetRule

# Load medspaCy's clinical pipeline
nlp = medspacy.load()

HIGH_RISK_SYMPTOMS = [
    "chest pain", 
    "difficulty breathing", 
    "shortness of breath", 
    "stiff neck", 
    "unconscious", 
    "seizure", 
    "severe bleeding", 
    "cannot breathe", 
    "stroke", 
    "heart attack"
]

# Adding common symptoms
OTHER_SYMPTOMS = ["fever", "headache", "throat hurts", "coughing", "nausea", "migraine"]

target_matcher = nlp.get_pipe("medspacy_target_matcher")
rules = [TargetRule(symptom, "CONDITION") for symptom in (HIGH_RISK_SYMPTOMS + OTHER_SYMPTOMS)]
target_matcher.add(rules)

def extract_entities(text):
    doc = nlp(text)
    entities = {"symptoms": [], "negations": [], "severity": "low"}

    for ent in doc.ents:
        # medspaCy automatically tags if a symptom is negated!
        if ent._.is_negated:
            entities["negations"].append(ent.text)
        else:
            entities["symptoms"].append(ent.text)
            
            # Check severity based on your high-risk list
            if any(s.lower() in HIGH_RISK_SYMPTOMS for s in entities["symptoms"]):
                entities["severity"] = "high"
        
    return entities

if __name__ == "__main__":

    test_cases = [
        "I have a fever and a headache",
        "I have chest pain but no fever",
        "I have a stiff neck and a migraine",
        "My throat hurts but no coughing",
        "I am having a seizure"
    ]

    for text in test_cases:
        print(f"\nInput: {text}")
        result = extract_entities(text)
        
        print(f"  Symptoms:  {result['symptoms']}")
        print(f"  Negations: {result['negations']}")
        print(f"  Severity:  {result['severity'].upper()}")
