import os
import pdfplumber
import ollama
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})
app.config["UPLOAD_FOLDER"] = "uploads"
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)


def extract_text_from_pdf(file):
    """Extract text from a PDF file."""
    text = ""
    try:
        with pdfplumber.open(file) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""  # Extract text safely
    except Exception as e:
        return f"Error extracting text: {str(e)}"
    return text.strip() if text.strip() else "No readable text found."


def generate_review(text, mode, user_description=""):
    """Generate a resume review using Ollama (Mistral)."""
    prompt = f"""
    You are an AI reviewing a resume. The mode is '{mode}'.
    
    User Description: {user_description if user_description else "Not provided"}  
    Resume Text: {text}

    If the mode is 'true_review':
    - Provide professional, structured, and constructive feedback.
    - Mention strengths and areas for improvement in a positive manner.

    If the mode is 'roast':
    - Be brutally honest, sarcastic, and funny.
    - Make jokes, but ensure feedback is still useful.

    Your response should be structured as:
    1. Strengths
    2. Weaknesses
    3. Grammar & Formatting Issues
    4. Missing Sections (if any)
    5. Final Feedback
    """
    response = ollama.chat(
        model="mistral", messages=[{"role": "user", "content": prompt}]
    )
    return response["message"]["content"]


@app.route("/upload", methods=["POST"])
def upload_resume():
    """Handle resume upload and review generation."""
    if "resume" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["resume"]
    mode = request.form.get("mode", "true_review")
    user_description = request.form.get("user_description", "")

    if not file or file.filename == "":
        return jsonify({"error": "Invalid file"}), 400

    # Extract text from PDF
    resume_text = extract_text_from_pdf(file)

    if "Error" in resume_text or resume_text == "No readable text found.":
        return jsonify({"error": resume_text}), 400

    # Generate review
    review = generate_review(resume_text, mode, user_description)
    return jsonify({"review": review})


if __name__ == "__main__":
    app.run(debug=True)
