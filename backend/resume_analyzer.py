import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import pdfplumber
import docx
import tempfile
import traceback

# Initialize Flask app
app = Flask(__name__)
CORS(
    app,
    resources={
        r"/*": {
            "origins": ["http://localhost:5173", "http://127.0.0.1:5173", "https://your-production-domain.com"],
            "methods": ["POST", "GET", "OPTIONS"],
            "allow_headers": ["Content-Type", "Accept"],
            "supports_credentials": True,
            "max_age": 3600,
        }
    },
)
app.config["UPLOAD_FOLDER"] = "uploads"
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

# Load environment variables and configure Gemini
load_dotenv()
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables. Please check your .env file.")
genai.configure(api_key=api_key)

# Configure the model
generation_config = {
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
}

# Initialize the model
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
)


def extract_text_from_pdf(file_data):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
        temp_file.write(file_data)
        temp_file_path = temp_file.name

    text = ""
    try:
        with pdfplumber.open(temp_file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:  # Check if text extraction was successful
                    text += page_text + "\n"
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        traceback.print_exc()
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)

    return text


def extract_text_from_docx(file_data):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as temp_file:
        temp_file.write(file_data)
        temp_file_path = temp_file.name

    text = ""
    try:
        doc = docx.Document(temp_file_path)
        for para in doc.paragraphs:
            text += para.text + "\n"
    except Exception as e:
        print(f"Error extracting DOCX text: {e}")
        traceback.print_exc()
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)

    return text


def analyze_resume(resume_text: str, mode: str) -> dict:
    print(f"Analyzing resume with mode: {mode}")
    print("\n=== Resume Analysis Started ===")
    print(f"Mode: {mode}")
    # print("\nResume Text (first 200 chars):")
    # print(resume_text[:200] + "...\n")

    # Enhanced prompt with instructions for more detailed feedback
    prompt = f"""You are a professional resume analyzer with extensive HR and recruiting experience. Analyze this resume and provide detailed, actionable feedback in both professional and humorous ways.

Resume Text:
{resume_text}

Provide your analysis in this exact JSON format:
{{
    "genuine": {{
        "overall_review": "Comprehensive professional summary of the resume (60-100 words). Include overall impression and 2-3 key takeaways.",
        "format": {{
            "score": anything between 0-10,
            "good_point": "Detailed professional positive feedback about format and layout (30-50 words). Mention specific elements that work well.",
            "improvement_area": "Specific, actionable professional suggestion for improving format (30-50 words). Include exact changes they should make."
        }},
        "content_quality": {{
            "score": anything between 0-10,
            "good_point": "Detailed professional positive feedback about content quality (30-50 words). Highlight effective descriptions and powerful language used.",
            "improvement_area": "Specific, actionable professional suggestions for improving content quality (30-50 words). Include examples where possible."
        }},
        "skills_presentation": {{
            "score": anything between 0-10,
            "good_point": "Detailed professional positive feedback about skills presentation (30-50 words). Identify strong skills or effective presentation techniques.",
            "improvement_area": "Specific, actionable professional suggestions for improving skills presentation (30-50 words). Suggest reorganization or additional skills to highlight."
        }},
        "ats_compatibility": {{
            "score": anything between 0-10,
            "good_point": "Detailed professional positive feedback about ATS compatibility (30-50 words). Note effective keywords and optimized sections.",
            "improvement_area": "Specific, actionable professional suggestions for improving ATS compatibility (30-50 words). Include keywords or formatting changes."
        }}
    }},
    "roast": {{
        "overall_review": "Clever, witty one-liner that roasts the resume while still being somewhat constructive",
        "format": {{
            "score": anything between 0-10,
            "good_point": "Humorous but somewhat constructive feedback about format (30-50 words). Be creative and witty.",
            "improvement_area": "Funny but somewhat helpful suggestion for improvement (30-50 words). Use amusing comparisons or metaphors."
        }},
        "content_quality": {{
            "score": anything between 0-10,
            "good_point": "Humorous but somewhat constructive feedback about content (30-50 words). Use witty observations.",
            "improvement_area": "Funny but somewhat helpful suggestion for content improvement (30-50 words). Use amusing comparisons or metaphors."
        }},
        "skills_presentation": {{
            "score": anything between 0-10,
            "good_point": "Humorous but somewhat constructive feedback about skills (30-50 words). Be entertaining but include a real observation.",
            "improvement_area": "Funny but somewhat helpful suggestion for skills improvement (30-50 words). Use amusing comparisons or metaphors."
        }},
        "ats_compatibility": {{
            "score": anything between 0-10,
            "good_point": "Humorous but somewhat constructive feedback about ATS compatibility (30-50 words). Make a joke while giving real insight.",
            "improvement_area": "Funny but somewhat helpful suggestion for ATS improvement (30-50 words). Use amusing comparisons or metaphors."
        }}
    }}
}}

For the genuine feedback, maintain a balanced, constructive tone while providing specific, actionable advice. For the roast, be humorous and witty but ensure there's still useful feedback beneath the jokes. 

Keep scores between 0-10, with 0 being terrible and 10 being perfect. Make feedback detailed but concise, and keep the overall_review to 60-100 words for genuine and brief for roast."""

    try:
        print("\n=== Sending Request to Gemini ===")
        # Increase max output tokens to accommodate longer responses
        response = model.generate_content(
            prompt,
            generation_config={"temperature": 0.7, "top_p": 0.95, "top_k": 40, "max_output_tokens": 12000},
        )

        try:
            # Clean the response text by removing markdown code block syntax
            cleaned_response = response.text.strip()
            if cleaned_response.startswith("```json"):
                cleaned_response = cleaned_response[7:]  # Remove ```json
            if cleaned_response.endswith("```"):
                cleaned_response = cleaned_response[:-3]  # Remove closing ```

            gemini_response = json.loads(cleaned_response.strip())
            print("\nParsed JSON Response:")
            # print(json.dumps(gemini_response, indent=2))

            if validate_scores(gemini_response):
                print("\n✅ Response validation successful")
                return gemini_response
            else:
                print("\n❌ Response validation failed")
                raise ValueError("Invalid response format from Gemini API")

        except json.JSONDecodeError as e:
            print(f"\n❌ JSON Parse Error: {e}")
            print("Raw text that failed to parse:", response.text)
            raise ValueError(f"Failed to parse Gemini API response: {e}")

    except Exception as e:
        print(f"\n❌ Gemini API Error: {str(e)}")
        print("Full error details:", e)
        traceback.print_exc()
        
        # Return default feedback if parsing fails with proper structure
        print("\n⚠️ Using fallback response")
        return {
            "genuine": {
                "overall_review": "Acceptable professional resume that needs some improvements",
                "format": {
                    "score": 7,
                    "good_point": "Clean layout",
                    "improvement_area": "Add more spacing",
                },
                "content_quality": {
                    "score": 7,
                    "good_point": "Good experience details",
                    "improvement_area": "Add more metrics",
                },
                "skills_presentation": {
                    "score": 7,
                    "good_point": "Clear skill sections",
                    "improvement_area": "Prioritize relevant skills",
                },
                "ats_compatibility": {
                    "score": 7,
                    "good_point": "Good keyword usage",
                    "improvement_area": "Add more industry terms",
                },
            },
            "roast": {
                "overall_review": "This resume is as exciting as watching paint dry",
                "format": {
                    "score": 6,
                    "good_point": "At least it's not handwritten",
                    "improvement_area": "Maybe try using colors from this century?",
                },
                "content_quality": {
                    "score": 6,
                    "good_point": "Words are mostly spelled correctly",
                    "improvement_area": "Try sounding less like a robot",
                },
                "skills_presentation": {
                    "score": 6,
                    "good_point": "Listed some actual skills",
                    "improvement_area": "Maybe list 'creativity' if you ever find any",
                },
                "ats_compatibility": {
                    "score": 6,
                    "good_point": "ATS might actually find this document",
                    "improvement_area": "Try keywords that aren't from 1995",
                },
            }
        }


def validate_scores(feedback: dict) -> bool:
    """Validate that all scores are integers between 0 and 10"""
    modes = ["genuine", "roast"]
    categories = [
        "format",
        "content_quality",
        "skills_presentation",
        "ats_compatibility",
    ]

    for mode in modes:
        if mode not in feedback:
            return False
        if "overall_review" not in feedback[mode]:
            return False
        for category in categories:
            if category not in feedback[mode]:
                return False
            score = feedback[mode][category].get("score")
            if not isinstance(score, (int, float)) or score < 0 or score > 10:
                return False

    return True


@app.route("/analyze", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "message": "Backend is running"}), 200


@app.route("/analyze", methods=["POST"])
def analyze_resume_endpoint():
    try:
        # Check if file is present in request
        if "file" not in request.files:
            return jsonify({"error": "No file part in the request"}), 400
            
        file = request.files["file"]
        
        # Check if file has a name
        if file.filename == "":
            return jsonify({"error": "No file selected for uploading"}), 400
            
        # Read the file data
        file_data = file.read()
        
        # Check if file has content
        if not file_data:
            return jsonify({"error": "Empty file uploaded"}), 400

        # Process based on file type
        if file.filename.lower().endswith(".pdf"):
            resume_text = extract_text_from_pdf(file_data)
        elif file.filename.lower().endswith(".docx"):
            resume_text = extract_text_from_docx(file_data)
        elif file.filename.lower().endswith(".doc"):
            return jsonify(
                {"error": "DOC format is not supported. Please convert to DOCX or PDF."}
            ), 400
        else:
            return jsonify({"error": f"Unsupported file format: {file.filename}"}), 400

        if not resume_text or resume_text.strip() == "":
            return jsonify({"error": "Could not extract text from the provided file"}), 400

        # Get analysis mode (default to "both")
        mode = request.form.get("mode", "both")
        
        # Analyze resume
        analysis_result = analyze_resume(resume_text, mode)

        # Return the result
        return jsonify({"analysis": analysis_result})

    except Exception as e:
        print(f"Error in endpoint: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": f"Server error: {str(e)}"}), 500


if __name__ == "__main__":
    # Don't use debug=True in production
    app.run(host="0.0.0.0", port=5000, debug=False)
