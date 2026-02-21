class DiagnosisEngine:

    def evaluate(self, clinical_data):

        # Normalize inputs
        symptoms = [s.lower() for s in clinical_data.get("symptoms", [])]
        history = [h.lower() for h in clinical_data.get("history", [])]

        scores = {
            "Myocardial Infarction": 0,
            "Angina": 0,
            "Stroke": 0,
            "Hypertension": 0,
            "Type 2 Diabetes": 0,
            "Asthma": 0,
            "Pneumonia": 0,
            "Viral Fever": 0,
            "Migraine": 0,
            "Gastroenteritis": 0,
            "GERD": 0
        }

        # --------------------------
        # Myocardial Infarction
        # --------------------------
        if "chest pain" in symptoms:
            scores["Myocardial Infarction"] += 3
            scores["Angina"] += 2

        if "sweating" in symptoms:
            scores["Myocardial Infarction"] += 2

        if "nausea" in symptoms:
            scores["Myocardial Infarction"] += 1
            scores["Migraine"] += 1

        # --------------------------
        # Stroke
        # --------------------------
        if "weakness" in symptoms or "facial droop" in symptoms:
            scores["Stroke"] += 3

        if "slurred speech" in symptoms:
            scores["Stroke"] += 3

        if "hypertension" in history:
            scores["Stroke"] += 1

        # --------------------------
        # Hypertension
        # --------------------------
        if "headache" in symptoms:
            scores["Hypertension"] += 1
            scores["Migraine"] += 2

        if "dizziness" in symptoms:
            scores["Hypertension"] += 1

        if "hypertension" in history or "high blood pressure" in history:
            scores["Hypertension"] += 4

        # --------------------------
        # Type 2 Diabetes
        # --------------------------
        if "frequent urination" in symptoms:
            scores["Type 2 Diabetes"] += 2

        if "excessive thirst" in symptoms:
            scores["Type 2 Diabetes"] += 2

        if "diabetes" in history:
            scores["Type 2 Diabetes"] += 4

        # --------------------------
        # Asthma / Pneumonia
        # --------------------------
        if "wheezing" in symptoms:
            scores["Asthma"] += 4

        if "shortness of breath" in symptoms:
            scores["Asthma"] += 2
            scores["Pneumonia"] += 2

        if "fever" in symptoms:
            scores["Pneumonia"] += 1
            scores["Viral Fever"] += 3

        if "cough" in symptoms:
            scores["Pneumonia"] += 2

        # --------------------------
        # Viral Fever
        # --------------------------
        if "body ache" in symptoms:
            scores["Viral Fever"] += 2

        if "fatigue" in symptoms:
            scores["Viral Fever"] += 1

        # --------------------------
        # Migraine
        # --------------------------
        if "sensitivity to light" in symptoms:
            scores["Migraine"] += 3

        # --------------------------
        # Gastroenteritis
        # --------------------------
        if "diarrhea" in symptoms:
            scores["Gastroenteritis"] += 4

        if "vomiting" in symptoms:
            scores["Gastroenteritis"] += 2

        if "abdominal pain" in symptoms:
            scores["Gastroenteritis"] += 1

        # --------------------------
        # GERD
        # --------------------------
        if "burning sensation" in symptoms or "heartburn" in symptoms:
            scores["GERD"] += 4

        if "acid reflux" in symptoms:
            scores["GERD"] += 3

        # Convert scores
        results = []
        for diagnosis, score in scores.items():
            if score > 0:
                confidence = min(score * 15, 95)
                results.append({
                    "diagnosis": diagnosis,
                    "confidence": confidence
                })

        results.sort(key=lambda x: x["confidence"], reverse=True)

        return results[:3]
