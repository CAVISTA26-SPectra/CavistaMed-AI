class TriageEngine:
    """
    Evaluates clinical data to determine severity and suggest actions.
    """

    def evaluate(self, clinical_data):

        symptoms = [s.lower() for s in clinical_data.get("symptoms", [])]
        vitals = clinical_data.get("vitals", {})

        severity_score = 0
        red_flags = []

        # ----------------------------
        # Critical Symptom Checks
        # ----------------------------
        if "chest pain" in symptoms and "sweating" in symptoms:
            red_flags.append("Possible Cardiac Event")
            severity_score += 3

        if any(x in symptoms for x in ["weakness", "facial droop", "slurred speech"]):
            red_flags.append("Possible Stroke Signs")
            severity_score += 3

        if any(x in symptoms for x in ["unconscious", "severe bleeding"]):
            red_flags.append("Critical Emergency")
            severity_score += 4

        # ----------------------------
        # Vitals Checks
        # ----------------------------
        if vitals.get("SpO2", 100) < 90:
            red_flags.append("Low Oxygen Saturation (<90%)")
            severity_score += 3

        if vitals.get("heart_rate", 80) > 130:
            red_flags.append("Severe Tachycardia")
            severity_score += 2

        if vitals.get("systolic_bp", 120) < 90:
            red_flags.append("Hypotension")
            severity_score += 3

        # ----------------------------
        # Determine Severity
        # ----------------------------
        if severity_score >= 3:
            severity = "HIGH"
            color = "RED"
            reasoning = "Immediate medical attention required."
        elif any(x in symptoms for x in ["fever", "vomiting", "shortness of breath"]):
            severity = "MEDIUM"
            color = "YELLOW"
            reasoning = "Requires timely evaluation."
        else:
            severity = "LOW"
            color = "GREEN"
            reasoning = "Routine monitoring recommended."

        return {
            "triage_level": severity,
            "led_color": color,
            "reasoning": reasoning,
            "detected_red_flags": red_flags,
            "severity_score": severity_score
        }
