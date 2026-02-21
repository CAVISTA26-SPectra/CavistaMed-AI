import requests

OLLAMA_URL = "http://localhost:11434/api/generate"

def generate_health_reply(user_text, language):

    prompt = f"""
You are Cavista Med AI, a clinical decision-support assistant.

You must follow these strict rules:
- Do NOT greet the user.
- Do NOT introduce yourself.
- Do NOT use generic conversation.
- Give medically relevant information only.
- Provide structured, clear health guidance.
- Be concise but medically accurate.
- Always include red flag warnings if symptoms could be serious.
- Never diagnose with certainty.
- Use neutral clinical tone.

User symptoms: {user_text}

Respond in this structure:

1. Possible Causes:
2. What You Can Do:
3. When To Seek Medical Help:

Now generate the response.
"""


    payload = {
        "model": "meditron:latest",
        "prompt": f"{prompt}\n\nUser: {user_text}",
        "stream": False
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload)

        if response.status_code == 200:
            data = response.json()
            return data.get("response", "No response from local model.")
        else:
            return f"Local AI error: {response.text}"

    except Exception as e:
        print("OLLAMA ERROR:", e)
        return "Could not connect to local AI."