import json
import os
from difflib import get_close_matches

class ICDMapper:
    def __init__(self, path="backend/data/icd_mapping.json"):
        # Resolve path relative to current working directory
        if not os.path.exists(path):
            # Fallback for when running from a different directory
            path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "icd_mapping.json")
            
        with open(path, "r") as f:
            self.icd_dict = json.load(f)

    def map_icd(self, diagnosis_list):
        """
        diagnosis_list format:
        [
            {"diagnosis": "Myocardial Infarction", "confidence": 82},
            {"diagnosis": "Hypertension", "confidence": 65}
        ]
        """
        results = []

        for item in diagnosis_list:
            diagnosis_name = item["diagnosis"]
            confidence = item["confidence"]

            icd_info = self.icd_dict.get(diagnosis_name)

            # Fuzzy match fallback
            if not icd_info:
                match = get_close_matches(diagnosis_name, self.icd_dict.keys(), n=1)
                if match:
                    icd_info = self.icd_dict[match[0]]

            if icd_info:
                results.append({
                    "diagnosis": diagnosis_name,
                    "icd_code": icd_info["code"],
                    "description": icd_info["description"],
                    "confidence": confidence,
                    "status": "Probable" if confidence >= 50 else "Suggested"
                })
            else:
                results.append({
                    "diagnosis": diagnosis_name,
                    "icd_code": "Not Found",
                    "description": "No matching ICD code",
                    "confidence": confidence,
                    "status": "Review Required"
                })

        return results
