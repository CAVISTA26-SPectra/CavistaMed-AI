import sys
import os
import json
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.models.clinical_data import create_clinical_data
from backend.pipeline import ClinicalPipeline


def main():
    print("starting Aegis-S3 AI Brain pipeline test")

    # Mock input
    clinical_data = create_clinical_data(
        symptoms=["chest pain", "sweating", "nausea"],
        duration="2 hours",
        severity="severe",
        vitals={"heart_rate": 110, "systolic_bp": 140, "SpO2": 88},
        history=["hypertension"],
        allergies=["aspirin", "nsaid"]
    )

    print("\n--- CLINICAL DATA ---")
    print(json.dumps(clinical_data, indent=2))
    
    # Initialize the Unified Pipeline
    try:
        print("\nInitializing Pipeline Module Engine...")
        pipeline = ClinicalPipeline()
        
        # Run Data
        print("\nProcessing Clinical Data...")
        final_payload = pipeline.process_patient_data(clinical_data=clinical_data)

        print("\n--- FINAL SYSTEM OUTPUT ---")
        print(json.dumps(final_payload, indent=2))

    except Exception as e:
        print(f"Pipeline error: {str(e)}")

if __name__ == "__main__":
    main()
