# CareRelay Responsible AI

CareRelay is a hackathon prototype for helping clinicians review a synthetic patient's medical history. It is for demonstration only and is not for clinical use.

## Data Sources

- Demo patient data comes from Synthea FHIR R4 synthetic patient records.
- No real patient data or protected health information is used.
- The backend parses a local Synthea FHIR bundle into a smaller patient summary for the frontend.
- Drug warning text is retrieved from the public OpenFDA drug label API.

## AI and Automation Use

Implemented:
- FHIR parsing is deterministic Python code.
- Drug warning lookup uses OpenFDA label data. It does not use an LLM for drug interaction checking.
- First-visit brief generation calls a HuggingFace model when configured, with a deterministic fallback summary if the model is unavailable.
- The first-visit brief endpoint is designed to use a HuggingFace generative model. OpenBioLLM (`aaditya/Llama3-OpenBioLLM-70B`) was evaluated as the preferred clinical model but provider availability varies. The demo uses `meta-llama/Llama-3.1-8B-Instruct` with strict healthcare-safe prompting as a reliable fallback.

Planned:
- Medical named entity extraction using a HuggingFace clinical NER model.

AI output will be framed as an assistive summary for clinician review, not as a diagnosis or treatment recommendation.

## Safety Principles

- Use structured patient data where possible instead of asking an LLM to infer facts.
- Use deterministic sources for safety-sensitive checks such as drug warnings.
- Include a visible disclaimer: "For demonstration only. Uses synthetic patient data. Not for clinical use."
- Require clinician review for any AI-generated summary.
- Avoid presenting the app as a certified medical device or validated diagnostic tool.

## Known Risks

- AI-generated summaries can omit important details, hallucinate unsupported facts, or overstate certainty.
- OpenFDA drug label text can be broad and may not represent patient-specific interaction risk.
- Synthea data is synthetic and may not fully reflect real clinical complexity or local care patterns.
- The demo does not include production-grade authentication, audit logs, encryption, or access controls.

## Mitigations

- The app keeps source clinical data available alongside summaries.
- Drug warning checks are separated from LLM generation.
- The backend returns disclaimer text with patient data and OpenFDA responses.
- For a production system, CareRelay would need HIPAA-compliant authentication, encrypted storage, audit logging, patient consent controls, and vendor agreements for any external services.

## Bias and Limitations

Synthea creates realistic synthetic records, but it is still simulated data. A model or interface that works well on one synthetic patient may not generalize to real patients across different demographics, languages, health systems, or countries.

The Nepal use case is part of the product vision, but this prototype has not been validated against Nepal-specific clinical workflows, language needs, connectivity constraints, or regulatory requirements.

## Human Oversight

CareRelay is designed for clinician-in-the-loop review. The intended user is a doctor who can compare AI-generated summaries and warning cards against the underlying patient record before making any clinical decision.
