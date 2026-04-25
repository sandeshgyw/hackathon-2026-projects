"""
db/db.py  —  base: This performs patient related opretions CRUD using SQLite
Run directly to test:  python db.py
"""

import json
import sqlite3
import uuid
from pathlib import Path

DB_PATH     = Path(__file__).parent / "triage.db"
SCHEMA_PATH = Path(__file__).parent / "schema.sql"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    """Create tables from schema.sql. Safe to call multiple times."""
    conn = get_connection()
    with open(SCHEMA_PATH) as f:
        conn.executescript(f.read())
    conn.commit()
    conn.close()
    print(f"[db] Tables created at {DB_PATH}")


# ── Patient ────────────────────────────────────────────────────

def save_patient(name: str, age: int, sex: str,
                 height_cm: float, weight_kg: float, place: str) -> str:
    patient_id = str(uuid.uuid4())
    conn = get_connection()
    conn.execute(
        "INSERT INTO patients (id, name, age, sex, height_cm, weight_kg, place) "
        "VALUES (?, ?, ?, ?, ?, ?, ?)",
        (patient_id, name, age, sex, height_cm, weight_kg, place)
    )
    conn.commit()
    conn.close()
    return patient_id


def get_patient(patient_id: str) -> dict | None:
    conn = get_connection()
    row = conn.execute("SELECT * FROM patients WHERE id = ?", (patient_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


# ── Allergies ──────────────────────────────────────────────────

def save_allergy(patient_id: str, allergen: str, severity: str = "unknown") -> str:
    allergy_id = str(uuid.uuid4())
    conn = get_connection()
    conn.execute(
        "INSERT INTO allergies (id, patient_id, allergen, severity) VALUES (?, ?, ?, ?)",
        (allergy_id, patient_id, allergen, severity)
    )
    conn.commit()
    conn.close()
    return allergy_id


# ── Known conditions ───────────────────────────────────────────

def save_known_condition(patient_id: str, condition_name: str,
                          icd10_code: str = "") -> str:
    cond_id = str(uuid.uuid4())
    conn = get_connection()
    conn.execute(
        "INSERT INTO known_conditions (id, patient_id, condition_name, icd10_code) "
        "VALUES (?, ?, ?, ?)",
        (cond_id, patient_id, condition_name, icd10_code)
    )
    conn.commit()
    conn.close()
    return cond_id


# ── Physician ──────────────────────────────────────────────────

def save_physician(patient_id: str, doctor_name: str,
                   hospital_name: str, email: str) -> str:
    phys_id = str(uuid.uuid4())
    conn = get_connection()
    conn.execute(
        "INSERT INTO physician_details (id, patient_id, doctor_name, hospital_name, email) "
        "VALUES (?, ?, ?, ?, ?)",
        (phys_id, patient_id, doctor_name, hospital_name, email)
    )
    conn.commit()
    conn.close()
    return phys_id


# ── Full context (used by preprocessing layer) ─────────────────

def get_patient_full_context(patient_id: str) -> dict:
    conn = get_connection()
    patient    = conn.execute("SELECT * FROM patients WHERE id = ?", (patient_id,)).fetchone()
    allergies  = conn.execute("SELECT allergen, severity FROM allergies WHERE patient_id = ?", (patient_id,)).fetchall()
    conditions = conn.execute("SELECT condition_name, icd10_code FROM known_conditions WHERE patient_id = ?", (patient_id,)).fetchall()
    physician  = conn.execute("SELECT * FROM physician_details WHERE patient_id = ?", (patient_id,)).fetchone()
    conn.close()
    return {
        "patient":          dict(patient)    if patient   else {},
        "allergies":        [dict(r) for r in allergies],
        "known_conditions": [dict(r) for r in conditions],
        "physician":        dict(physician)  if physician else {}
    }


# ── Quick test ─────────────────────────────────────────────────

if __name__ == "__main__":
    init_db()

    pid = save_patient("Jane Doe", 35, "female", 162.0, 65.0, "Austin, TX")
    print(f"Created patient: {pid}")

    save_allergy(pid, "penicillin", "severe")
    save_known_condition(pid, "Type 2 Diabetes", "E11")
    save_physician(pid, "Dr. Smith", "Austin General", "dr.smith@example.com")

    ctx = get_patient_full_context(pid)
    print(json.dumps(ctx, indent=2))
