import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import pdfplumber
import docx
import tempfile

# Initialize Flask app
app = Flask(__name__)
CORS(app, 
     resources={r"/*": {
         "origins": ["http://localhost:5173"],
         "methods": ["POST", "GET", "OPTIONS"],
         "allow_headers": ["Content-Type", "Accept"],
         "supports_credentials": True
     }})
app.config["UPLOAD_FOLDER"] = "uploads"
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

# Load environment variables and configure Gemini
load_dotenv()
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

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
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
        temp_file.write(file_data)
        temp_file_path = temp_file.name
    
    text = ""
    try:
        with pdfplumber.open(temp_file_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() + "\n"
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
    finally:
        os.unlink(temp_file_path)
    
    return text

def extract_text_from_docx(file_data):
    with tempfile.NamedTemporaryFile(delete=False, suffix='.docx') as temp_file:
        temp_file.write(file_data)
        temp_file_path = temp_file.name
    
    text = ""
    try:
        doc = docx.Document(temp_file_path)
        for para in doc.paragraphs:
            text += para.text + "\n"
    except Exception as e:
        print(f"Error extracting DOCX text: {e}")
    finally:
        os.unlink(temp_file_path)
    
    return text

def analyze_resume(resume_text: str, mode: str) -> dict:
    # System instructions for resume analysis
    system_prompt = """Analyze the provided resume and provide feedback in the following JSON format:
    {
        "format": {
            "score": <score between 0-10>,
            "good_point": "<highlight a positive aspect of the format>",
            "improvement_area": "<suggest one specific improvement>"
        },
        "content_quality": {
            "score": <score between 0-10>,
            "good_point": "<highlight effective content>",
            "improvement_area": "<suggest content improvement>"
        },
        "skills_presentation": {
            "score": <score between 0-10>,
            "good_point": "<positive aspect of skills presentation>",
            "improvement_area": "<how to better present skills>"
        },
        "ats_compatibility": {
            "score": <score between 0-10>,
            "good_point": "<positive ATS aspect>",
            "improvement_area": "<ATS improvement suggestion>"
        }
    }

    Mode: {}
    If mode is "genuine": Provide professional, constructive feedback
    If mode is "roast": Be humorously critical while maintaining helpful insights
    
    Ensure all scores are integers between 0 and 10.
    Keep each feedback point concise (max 100 characters).
    Focus on actionable improvements.
    """.format(mode)

    try:
        chat = model.start_chat(history=[{
            "role": "system",
            "content": system_prompt
        }])

        response = chat.send_message(resume_text)
        
        try:
            feedback = json.loads(response.text)
            
            # Transform the response to match frontend expectations
            transformed_feedback = {
                "format": {
                    "score": feedback["categories"][0]["score"],
                    "good_point": feedback["categories"][0]["improvements"][0] if feedback["categories"][0]["improvements"] else "",
                    "improvement_area": feedback["categories"][0]["issues"][0] if feedback["categories"][0]["issues"] else ""
                },
                "content_quality": {
                    "score": feedback["categories"][1]["score"],
                    "good_point": feedback["categories"][1]["improvements"][0] if feedback["categories"][1]["improvements"] else "",
                    "improvement_area": feedback["categories"][1]["issues"][0] if feedback["categories"][1]["issues"] else ""
                },
                "skills_presentation": {
                    "score": feedback["categories"][2]["score"],
                    "good_point": feedback["categories"][2]["improvements"][0] if feedback["categories"][2]["improvements"] else "",
                    "improvement_area": feedback["categories"][2]["issues"][0] if feedback["categories"][2]["issues"] else ""
                },
                "ats_compatibility": {
                    "score": feedback["categories"][3]["score"],
                    "good_point": feedback["categories"][3]["improvements"][0] if feedback["categories"][3]["improvements"] else "",
                    "improvement_area": feedback["categories"][3]["issues"][0] if feedback["categories"][3]["issues"] else ""
                }
            }
            
            return transformed_feedback
            
        except json.JSONDecodeError:
            return {
                "error": "Failed to parse Gemini response",
                "raw_response": response.text
            }

    except Exception as e:
        return {
            "error": f"Analysis failed: {str(e)}"
        }

def validate_scores(feedback: dict) -> bool:
    """Validate that all scores are integers between 0 and 10"""
    categories = ["format", "content_quality", "skills_presentation", "ats_compatibility"]
    
    for category in categories:
        if category not in feedback:
            return False
        score = feedback[category].get("score")
        if not isinstance(score, (int, float)) or score < 0 or score > 10:
            return False
    
    return True

@app.route('/analyze', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Backend is running"}), 200

@app.route('/analyze', methods=['POST'])
def analyze_resume_endpoint():
    try:
        if 'resume' in request.json:
            resume_text = request.json.get('resume')
        elif 'file' in request.files:
            file = request.files['file']
            file_data = file.read()
            
            if file.filename.endswith('.pdf'):
                resume_text = extract_text_from_pdf(file_data)
            elif file.filename.endswith('.docx'):
                resume_text = extract_text_from_docx(file_data)
            elif file.filename.endswith('.doc'):
                return jsonify({"error": "DOC format is not supported. Please convert to DOCX or PDF."}), 400
            else:
                return jsonify({"error": "Unsupported file format"}), 400
        else:
            return jsonify({"error": "No resume text or file provided"}), 400

        if not resume_text or resume_text.strip() == "":
            return jsonify({"error": "Could not extract text from the provided file"}), 400

        mode = request.form.get('mode', 'genuine')
        analysis_result = analyze_resume(resume_text, mode)
        
        return jsonify({"analysis": analysis_result})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)