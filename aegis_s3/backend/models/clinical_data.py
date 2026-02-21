"""
Clinical Data Schema Definition

This file defines the expected dictionary structure
for clinical data flowing through the pipeline.

We use pure dictionaries for hackathon simplicity.
"""

def create_clinical_data(
    symptoms=None,
    duration=None,
    severity=None,
    vitals=None,
    history=None,
    medications=None,
    allergies=None
):
    """
    Returns standardized clinical data dictionary.
    """

    return {
        "symptoms": symptoms or [],
        "duration": duration,
        "severity": severity,
        "vitals": vitals or {},
        "history": history or [],
        "medications": medications or [],
        "allergies": allergies or []
    }
