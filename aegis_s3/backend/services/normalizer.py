class DiagnosisNormalizer:

    def __init__(self):
        # Store alias map in lowercase for safe matching
        self.alias_map = {
            "heart attack": "Myocardial Infarction",
            "mi": "Myocardial Infarction",
            "high bp": "Hypertension"
        }

    def normalize(self, diagnosis_list):
        for item in diagnosis_list:
            name = item.get("diagnosis", "")
            normalized_key = name.strip().lower()

            if normalized_key in self.alias_map:
                item["diagnosis"] = self.alias_map[normalized_key]

        return diagnosis_list
