# CareRelay

CareRelay is a hackathon prototype that helps a new doctor quickly understand a patient's medical history from a patient-carried medical ID card and QR code.

**Track:** Health Data & Interoperability

**CareDevi AI Healthcare Hackathon 2026**

The demo uses synthetic Synthea FHIR R4 patient data only. It is not for clinical use.

## Team

| Member | Role |
|---|---|
| Sanskriti | Backend, FHIR parsing, Flask APIs, Hugging Face integration, OpenFDA |
| Manushi | Frontend, React UI, Tailwind styling, charts |
| Binit | Optional chat feature / support if time allows |

## Problem

When a patient sees a new doctor, the doctor often has only a few minutes to understand years of history spread across PDFs, portals, medication lists, and incomplete records. Critical conditions, medication risks, allergies, and lab trends can be missed.

This problem is even harder in settings where patients may not have a full digital record. A portable medical ID card with a QR code can give clinicians a fast starting point.

## Solution

CareRelay gives the patient a medical ID card with a QR code. When a doctor scans it, the doctor can open a concise clinical snapshot instead of reading a long raw record.

The backend currently provides:

- A parsed Synthea FHIR patient summary
- Active conditions, current medications, allergies, vitals/labs, encounters, and timeline data
- OpenFDA drug label warning lookups
- A Hugging Face first-visit brief endpoint with deterministic fallback
- QR code generation for the patient summary URL

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, Flask, Flask-CORS |
| Data | Synthea synthetic FHIR R4 JSON |
| Drug warnings | OpenFDA drug label API |
| AI brief | Hugging Face router, `meta-llama/Llama-3.1-8B-Instruct` |
| QR code | `qrcode[pil]` |
| Frontend | React + Tailwind planned/in progress |

## Implemented Backend Endpoints

```text
GET  /api/patient/default
POST /api/brief
GET  /api/drugs/interactions?meds=metformin,simvastatin,amlodipine
GET  /api/qr/default
```

Full backend API details are in [docs/backend-api.md](docs/backend-api.md).

## Setup

From the repository root:

```bash
cd projects/CareRelay/src/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a local `.env` file for Hugging Face:

```env
HF_API_KEY=hf_your_token_here
HF_BRIEF_MODEL=meta-llama/Llama-3.1-8B-Instruct
```

Do not commit `.env`.

Run the backend:

```bash
python app.py
```

The backend runs at:

```text
http://127.0.0.1:5000
```

## Quick Tests

Patient data:

```bash
curl -s http://127.0.0.1:5000/api/patient/default
```

First-visit brief:

```bash
curl -s -X POST http://127.0.0.1:5000/api/brief
```

Drug warnings:

```bash
curl "http://127.0.0.1:5000/api/drugs/interactions?meds=metformin,simvastatin,amlodipine"
```

QR code:

```bash
curl "http://127.0.0.1:5000/api/qr/default"
```

## Data Sources

- Synthea FHIR R4 synthetic patient data
- OpenFDA drug label API
- Hugging Face hosted model inference for first-visit brief generation

No real patient information or PHI is used.

## Responsible AI

See [responsible-ai.md](responsible-ai.md).

In short:

- This is a demonstration only, not a clinical tool.
- AI-generated summaries require clinician review.
- Drug warnings use OpenFDA label data instead of LLM-only reasoning.
- OpenBioLLM was evaluated as the preferred clinical model, but provider availability varied; the demo uses a working Hugging Face instruction model with strict prompting and fallback behavior.

## Limitations

- The demo uses one synthetic patient record.
- The frontend is still being connected.
- The app does not include production authentication, audit logging, encryption, consent management, or HIPAA deployment controls.
- OpenFDA label warnings are broad and are not patient-specific clinical recommendations.
- AI summaries can be incomplete or incorrect and must be reviewed by a clinician.

## Demo

Demo video/screenshots will be added before final submission.
