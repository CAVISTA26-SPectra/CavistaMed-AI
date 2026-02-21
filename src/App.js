import React, { useState, useRef } from "react";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef(null);
  const language = "en-US";

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported. Use Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      console.log("Listening...");
      setListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("Heard:", transcript);
      setText(transcript);
      sendToBackend(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopAssistant = () => {
    // Stop mic
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Stop speech synthesis
    window.speechSynthesis.cancel();

    setListening(false);
    setLoading(false);
  };

  const sendToBackend = async (transcript) => {
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: transcript,
          language: language,
        }),
      });

      const data = await res.json();

      if (res.ok && data.reply) {
        setResponse(data.reply);
        speak(data.reply);
      } else {
        setResponse("AI server error.");
      }
    } catch (error) {
      console.error("Error:", error);
      setResponse("Unable to connect to AI server.");
    }

    setLoading(false);
  };

  const speak = (message) => {
    const speech = new SpeechSynthesisUtterance(message);
    speech.lang = language;
    window.speechSynthesis.speak(speech);
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Cavista Med AI</h2>

        <div className="button-group">
          <button className="speak-btn" onClick={startListening}>
            🎤 Speak
          </button>

          <button className="stop-btn" onClick={stopAssistant}>
            ⛔ Stop
          </button>
        </div>

        <div className="status">
          {listening && <p className="listening">Listening...</p>}
          {loading && <p className="loading">Analyzing...</p>}
        </div>

        <div className="chat-box">
          <p><strong>You said:</strong> {text}</p>
          <p><strong>Assistant:</strong> {response}</p>
        </div>
      </div>
    </div>
  );
}

export default App;