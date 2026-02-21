from datetime import datetime


class EMRBuilder:

    def build(self, clinical_data, icd_results, triage_result=None, treatments=None):
        """
        Builds final structured EMR output.
        Assumes clinical_data is a dictionary.
        """

        symptoms = clinical_data.get("symptoms", [])
        chief_complaint = symptoms[0] if symptoms else ""

        assessment = icd_results[0]["diagnosis"] if icd_results else ""

        return {
            "session_id": "AEGIS-001",
            "timestamp": datetime.utcnow().isoformat(),
            "chief_complaint": chief_complaint,
            "symptoms": symptoms,
            "history": clinical_data.get("history", []),
            "vitals": clinical_data.get("vitals", {}),
            "assessment": assessment,
            "icd_codes": icd_results,
            "triage": triage_result,
            "treatment_plan": treatments
        }
