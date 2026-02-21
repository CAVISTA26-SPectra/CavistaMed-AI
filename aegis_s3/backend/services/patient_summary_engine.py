class PatientSummaryEngine:

    def __init__(self):
        self.simple_explanations = {
            "Myocardial Infarction": {
                "simple_name": "Heart Attack",
                "description": "A heart attack happens when blood flow to part of your heart is blocked."
            },
            "Pneumonia": {
                "simple_name": "Lung Infection",
                "description": "Pneumonia is an infection in your lungs that can cause cough and fever."
            },
            "Asthma": {
                "simple_name": "Breathing Condition",
                "description": "Asthma is a condition that makes your airways narrow, causing breathing difficulty."
            },
            "Viral Fever": {
                "simple_name": "Viral Infection",
                "description": "A viral fever is usually caused by a common infection and often improves with rest."
            },
            "Angina": {
                 "simple_name": "Chest Pain (Angina)",
                 "description": "Angina is chest pain or discomfort caused when your heart muscle doesn't get enough oxygen-rich blood."
             },
             "Stroke": {
                 "simple_name": "Stroke",
                 "description": "A stroke occurs when the blood supply to part of your brain is interrupted or reduced, preventing brain tissue from getting oxygen and nutrients."
             },
             "Hypertension": {
                 "simple_name": "High Blood Pressure",
                 "description": "High blood pressure is a common condition in which the long-term force of the blood against your artery walls is high enough that it may eventually cause health problems."
             },
             "Type 2 Diabetes": {
                 "simple_name": "Type 2 Diabetes",
                 "description": "Type 2 diabetes is an impairment in the way the body regulates and uses sugar (glucose) as a fuel."
             },
             "Migraine": {
                 "simple_name": "Migraine Headache",
                 "description": "A migraine can cause severe throbbing pain or a pulsing sensation, usually on one side of the head."
             },
             "Gastroenteritis": {
                 "simple_name": "Stomach Flu",
                 "description": "Gastroenteritis is an intestinal infection marked by diarrhea, cramps, nausea, vomiting and sometimes fever."
             },
             "GERD": {
                 "simple_name": "Acid Reflux",
                 "description": "Gastroesophageal reflux disease (GERD) occurs when stomach acid frequently flows back into the tube connecting your mouth and stomach (esophagus)."
             }
        }

    def generate(self, emr_data):

        diagnosis = emr_data.get("assessment") or "Unknown Condition"
        triage = emr_data.get("triage", {})
        treatment_plan = emr_data.get("treatment_plan", [])

        summary = {}

        # Diagnosis simplification
        if diagnosis in self.simple_explanations:
            summary["condition_name"] = self.simple_explanations[diagnosis]["simple_name"]
            summary["what_it_means"] = self.simple_explanations[diagnosis]["description"]
        else:
            summary["condition_name"] = diagnosis
            summary["what_it_means"] = "Your doctor has identified a medical condition that requires care."

        # Recovery instructions
        summary["recommended_actions"] = []
        if treatment_plan:
            for item in treatment_plan:
                for action in item.get("recommended_actions", []):
                    summary["recommended_actions"].append(action)

        # Medication instructions
        summary["medications"] = []
        if treatment_plan:
            for item in treatment_plan:
                for med in item.get("medications", []):
                    med_name = med.get("name", "the prescribed medication")
                    summary["medications"].append(
                        f"Take {med_name} as prescribed by your doctor."
                    )
                    
        # Deduplication to avoid repeating identical recommended actions or medications
        summary["recommended_actions"] = list(dict.fromkeys(summary["recommended_actions"]))
        summary["medications"] = list(dict.fromkeys(summary["medications"]))

        # Warnings
        summary["important_warnings"] = []
        if treatment_plan:
            for item in treatment_plan:
                for warning in item.get("warnings", []):
                    summary["important_warnings"].append(warning)

        # Emergency note
        if triage.get("triage_level") == "HIGH":
            summary["emergency_note"] = (
                "This condition requires urgent medical attention. "
                "Please follow hospital instructions carefully."
            )
        elif triage.get("triage_level") == "MEDIUM":
            summary["emergency_note"] = (
                "This condition requires timely medical follow-up."
            )
        else:
            summary["emergency_note"] = (
                "Follow the instructions provided and monitor your symptoms."
            )

        return summary
