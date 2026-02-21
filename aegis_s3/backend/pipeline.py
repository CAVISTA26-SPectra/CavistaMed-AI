import os
from models.clinical_data import create_clinical_data
from services.diagnosis_engine import DiagnosisEngine
from services.normalizer import DiagnosisNormalizer
from services.icd_mapper import ICDMapper
from services.emr_builder import EMRBuilder
from services.patient_summary_engine import PatientSummaryEngine
from services.triage_engine import TriageEngine
from services.treatment_engine import TreatmentEngine

class ClinicalPipeline:
    """
    Unified pipeline to process clinical data from symptoms to a complete EMR payload.
    """
    def __init__(self):
        # Initialize all intelligence modules once
        self.diagnosis_engine = DiagnosisEngine()
        self.normalizer = DiagnosisNormalizer()
        
        # Resolve the ICD mapping JSON path dynamically to prevent pathing issues
        icd_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "icd_mapping.json")
        self.icd_mapper = ICDMapper(path=icd_path)
        
        self.triage_engine = TriageEngine()
        self.treatment_engine = TreatmentEngine()
        self.emr_builder = EMRBuilder()
        self.summary_engine = PatientSummaryEngine()

    def process_patient_data(self, clinical_data: dict) -> dict:
        """
        Executes the AI Brain Pipeline End-to-End.
        Args:
            clinical_data (dict): The standardized dictionary containing patient symptoms, vitals, etc.
        Returns:
            dict: The final unified JSON payload containing the EMR and Patient Summary.
        """
        try:
            if not isinstance(clinical_data, dict):
                raise ValueError("clinical_data must be a dictionary")

            # Step 1: Diagnosis & Normalization
            diagnoses_raw = self.diagnosis_engine.evaluate(clinical_data)
            diagnoses_normalized = self.normalizer.normalize(diagnoses_raw)

            # Step 2: ICD Mapping
            icd_results = self.icd_mapper.map_icd(diagnoses_normalized)

            # Step 3: Triage Evaluation
            triage_results = self.triage_engine.evaluate(clinical_data)

            # Step 4: Treatment Generation
            treatments = self.treatment_engine.generate(icd_results, clinical_data)

            # Step 5: EMR Construction
            emr = self.emr_builder.build(
                clinical_data=clinical_data,
                icd_results=icd_results,
                triage_result=triage_results,
                treatments=treatments
            )

            # Step 6: Patient-Friendly Summary Generation
            patient_summary = self.summary_engine.generate(emr)

            # Final Output Payload
            return {
                "status": "success",
                "emr": emr,
                "triage": triage_results,
                "patient_summary": patient_summary
            }
            
        except Exception as e:
            return {
                "status": "error",
                "error_message": f"ClinicalPipeline encountered an error during processing: {str(e)}"
            }
