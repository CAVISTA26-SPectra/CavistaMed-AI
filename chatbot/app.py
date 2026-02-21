from flask import Flask, request, jsonify
from flask_cors import CORS
from ai_engine import generate_health_reply
from safety import apply_safety_filter

app = Flask(__name__)
CORS(app)

# ----------------------------------------
# Root Route (Prevents 404 in browser)
# ----------------------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "Cavista Med AI Backend Running",
        "message": "Use POST /analyze to interact with the API"
    })


# ----------------------------------------
# Health Check Route
# ----------------------------------------
@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "OK"})


# ----------------------------------------
# Main Analyze Endpoint
# ----------------------------------------
@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No input data provided"}), 400

        user_text = data.get("text")
        language = data.get("language", "en")

        if not user_text:
            return jsonify({"error": "No text provided"}), 400

        # Generate AI response
        ai_reply = generate_health_reply(user_text, language)

        # Apply safety filter
        safe_reply = apply_safety_filter(ai_reply)

        return jsonify({
            "reply": safe_reply,
            "status": "success"
        })

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({"error": "Internal server error"}), 500


# ----------------------------------------
# Run Server
# ----------------------------------------
if __name__ == "__main__":
    print("Starting Cavista Med AI Backend...")
    print("Running on http://127.0.0.1:8000")
    app.run(debug=True, host="127.0.0.1", port=8000)