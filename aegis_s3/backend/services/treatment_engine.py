class TreatmentEngine:
    """
    Generates rule-based treatment plans based on ICD codes.
    Includes:
    - Allergy checks
    - Drug–Drug interaction checks
    - Condition-based contraindications
    """

    def __init__(self):
        # Dictionary mapping ICD codes to treatment plans
        self.treatment_guidelines = {
            "I21.9": {
                "diagnosis": "Myocardial Infarction",
                "recommended_actions": [
                    "Continuous ECG monitoring",
                    "Establish IV access",
                    "Supplemental oxygen if SpO2 < 90%"
                ],
                "medications": [
                    {"name": "Aspirin", "dose": "162-325 mg", "route": "Chewed", "class": "Antiplatelet"},
                    {"name": "Nitroglycerin", "dose": "0.4 mg", "route": "Sublingual", "class": "Vasodilator"}
                ]
            },
            "I20.9": {
                "diagnosis": "Angina",
                "recommended_actions": [
                    "Rest and patient reassurance",
                    "12-lead ECG"
                ],
                "medications": [
                    {"name": "Nitroglycerin", "dose": "0.4 mg", "route": "Sublingual", "class": "Vasodilator"}
                ]
            },
            "I63.9": {
                "diagnosis": "Stroke",
                "recommended_actions": [
                    "Urgent Non-Contrast CT Head",
                    "Assess for tPA eligibility (time last known well)",
                    "NPO (Nothing by mouth) until swallow screen"
                ],
                "medications": []
            },
            "I10": {
                 "diagnosis": "Hypertension",
                 "recommended_actions": [
                     "Monitor blood pressure",
                     "Assess for end-organ damage (Hypertensive Emergency)"
                 ],
                 "medications": [
                     {"name": "Amlodipine", "dose": "5-10 mg", "route": "Oral", "class": "Calcium Channel Blocker"}
                 ]
            },
            "E11.9": {
                 "diagnosis": "Type 2 Diabetes",
                 "recommended_actions": [
                     "Check Point-of-Care Blood Glucose"
                 ],
                 "medications": [
                     {"name": "Metformin", "dose": "500 mg", "route": "Oral", "class": "Biguanide"}
                 ]
            },
            "J45.909": {
                 "diagnosis": "Asthma",
                 "recommended_actions": [
                     "Assess airway and breathing",
                     "Provide supplemental oxygen if needed"
                 ],
                 "medications": [
                     {"name": "Albuterol", "dose": "2.5-5 mg", "route": "Nebulizer", "class": "Beta-2 Agonist"}
                 ]
            },
            "J18.9": {
                 "diagnosis": "Pneumonia",
                 "recommended_actions": [
                     "Chest X-Ray",
                     "Sputum culture (if productive cough)"
                 ],
                 "medications": [
                     {"name": "Azithromycin", "dose": "500 mg", "route": "Oral/IV", "class": "Macrolide Antibiotic"}
                 ]
            },
            "B34.9": {
                 "diagnosis": "Viral Fever",
                 "recommended_actions": [
                     "Encourage fluid intake",
                     "Rest"
                 ],
                 "medications": [
                     {"name": "Paracetamol", "dose": "500-1000 mg", "route": "Oral", "class": "Antipyretic"}
                 ]
            },
            "G43.9": {
                 "diagnosis": "Migraine",
                 "recommended_actions": [
                     "Provide a dark, quiet room",
                     "Screen for neurologic deficits"
                 ],
                 "medications": [
                     {"name": "Ibuprofen", "dose": "400 mg", "route": "Oral", "class": "NSAID"}
                 ]
            },
             "K52.9": {
                 "diagnosis": "Gastroenteritis",
                 "recommended_actions": [
                     "Assess hydration status",
                     "Dietary modification (BRAT diet)"
                 ],
                 "medications": [
                     {"name": "Ondansetron", "dose": "4-8 mg", "route": "Oral/ODT/IV", "class": "Anti-emetic"}
                 ]
             },
             "K21.9": {
                 "diagnosis": "GERD",
                 "recommended_actions": [
                     "Keep head elevated",
                     "Avoid eating immediately before lying down"
                 ],
                 "medications": [
                     {"name": "Omeprazole", "dose": "20-40 mg", "route": "Oral", "class": "Proton Pump Inhibitor"}
                 ]
             }
        }

        # -----------------------------
        # Drug–Drug Interaction Rules
        # -----------------------------
        self.drug_interactions = [
            {
                "classes": ["antiplatelet", "nsaid"],
                "warning": "Increased bleeding risk when NSAIDs are combined with antiplatelets."
            },
            {
                "classes": ["anticoagulant", "nsaid"],
                "warning": "High bleeding risk when NSAIDs are combined with anticoagulants."
            }
        ]

        # -----------------------------
        # Condition-Based Contraindications
        # -----------------------------
        self.condition_contraindications = {
            "kidney disease": ["nsaid"],
            "asthma": ["beta blocker"]
        }

    def generate(self, icd_results, clinical_data):
        """
        Takes a list of ICD mapped results and the raw clinical data (dict)
        to check against allergies/history. Returns a list of treatments.
        """
        treatments = []
        patient_allergies = [a.lower().strip() for a in clinical_data.get("allergies", [])]
        patient_history = [h.lower().strip() for h in clinical_data.get("history", [])]

        all_selected_med_classes = []
        
        for icd in icd_results:
            code = icd.get("icd_code") or icd.get("code")
            
            # Skip unmapped or unfound
            if not code or code == "Not Found":
                continue
                
            guideline = self.treatment_guidelines.get(code)
            
            if guideline:
                plan = {
                    "diagnosis": guideline.get("diagnosis", "Unknown"),
                    "icd_code": code,
                    "recommended_actions": guideline.get("recommended_actions", []).copy(),
                    "medications": [],
                    "warnings": []
                }
                
                # Check medications against patient allergies/history
                for med in guideline.get("medications", []):
                    med_name = med.get("name", "").lower()
                    med_class = med.get("class", "").lower()
                    
                    is_contraindicated = False
                    
                    # Allergy Check
                    for allergy in patient_allergies:
                        if allergy in med_name or allergy in med_class:
                            plan["warnings"].append(f"CONTRAINDICATION: Patient allergic to {allergy}. DO NOT administer {med['name']}.")
                            is_contraindicated = True
                            break
                    
                    # Condition Contraindication Check
                    if not is_contraindicated:
                        for condition in patient_history:
                            restricted_classes = self.condition_contraindications.get(condition, [])
                            for restricted in restricted_classes:
                                if restricted in med_class:
                                    plan["warnings"].append(
                                        f"CONTRAINDICATION: {med['name']} should be avoided in patients with {condition}."
                                    )
                                    is_contraindicated = True
                                    break
                    
                    # Add medication if safe
                    if not is_contraindicated:
                        plan["medications"].append(med)
                        all_selected_med_classes.append(med_class)
                        
                treatments.append(plan)

        # --------------------------------
        # Drug–Drug Interaction Checking
        # --------------------------------
        for interaction in self.drug_interactions:
            required_classes = interaction["classes"]

            if all(any(req in selected for selected in all_selected_med_classes)
                   for req in required_classes):

                for plan in treatments:
                    plan["warnings"].append(
                        f"DRUG INTERACTION WARNING: {interaction['warning']}"
                    )

        return treatments
