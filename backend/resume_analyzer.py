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
         "origins": ["http://localhost:5173", "https://your-production-domain.com"],
         "methods": ["POST", "GET", "OPTIONS"],
         "allow_headers": ["Content-Type", "Accept"],
         "supports_credentials": True,
         "max_age": 3600
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
    print(f"Analyzing resume with mode: {mode}")
    print("\n=== Resume Analysis Started ===")
    print(f"Mode: {mode}")
    print("\nResume Text (first 200 chars):")
    print(resume_text[:200] + "...\n")
    
    # Fix the prompt string formatting
    prompt = f"""You are a resume analyzer. Analyze this resume and provide feedback in both professional and humorous ways.
Resume Text:
{resume_text}

Provide your analysis in this exact JSON format:
{{
    "genuine": {{
        "overall_review": "Brief professional summary of the resume",
        "format": {{
            "score": 7,
            "good_point": "professional positive feedback about format",
            "improvement_area": "professional suggestion for improvement"
        }},
        "content_quality": {{
            "score": 7,
            "good_point": "professional positive feedback about content",
            "improvement_area": "professional suggestion for content"
        }},
        "skills_presentation": {{
            "score": 7,
            "good_point": "professional positive feedback about skills",
            "improvement_area": "professional suggestion for skills"
        }},
        "ats_compatibility": {{
            "score": 7,
            "good_point": "professional positive feedback about ATS",
            "improvement_area": "professional suggestion for ATS"
        }}
    }},
    "roast": {{
        "overall_review": "Humorous one-liner about the resume",
        "format": {{
            "score": anything between 0-10,
            "good_point": "humorous positive feedback about format",
            "improvement_area": "humorous suggestion for improvement"
        }},
        "content_quality": {{
            "score": anything between 0-10,
            "good_point": "humorous positive feedback about content",
            "improvement_area": "humorous suggestion for content"
        }},
        "skills_presentation": {{
            "score": anything between 0-10,
            "good_point": "humorous positive feedback about skills",
            "improvement_area": "humorous suggestion for skills"
        }},
        "ats_compatibility": {{
            "score": anything between 0-10,
            "good_point": "humorous positive feedback about ATS",
            "improvement_area": "humorous suggestion for ATS"
        }}
    }}
}}

Keep scores between 0-10, feedback concise, and overall_review under 100 characters."""

    try:
        print("\n=== Sending Request to Gemini ===")
        response = model.generate_content(prompt)
        
        try:
            # Clean the response text by removing markdown code block syntax
            cleaned_response = response.text.strip()
            if cleaned_response.startswith('```json'):
                cleaned_response = cleaned_response[7:]  # Remove ```json
            if cleaned_response.endswith('```'):
                cleaned_response = cleaned_response[:-3]  # Remove closing ```
            
            gemini_response = json.loads(cleaned_response.strip())
            print("\nParsed JSON Response:")
            print(json.dumps(gemini_response, indent=2))
            
            if validate_scores(gemini_response):
                print("\n✅ Response validation successful")
                return gemini_response
            else:
                print("\n❌ Response validation failed")
                
        except json.JSONDecodeError as e:
            print(f"\n❌ JSON Parse Error: {e}")
            print("Raw text that failed to parse:", response.text)
            
        # Return default feedback if parsing fails
        print("\n⚠️ Using fallback response")
        return {
            "format": {
                "score": 7,
                "good_point": "Clean layout",
                "improvement_area": "Add more spacing"
            },
            "content_quality": {
                "score": 7,
                "good_point": "Good experience details",
                "improvement_area": "Add more metrics"
            },
            "skills_presentation": {
                "score": 7,
                "good_point": "Clear skill sections",
                "improvement_area": "Prioritize relevant skills"
            },
            "ats_compatibility": {
                "score": 7,
                "good_point": "Good keyword usage",
                "improvement_area": "Add more industry terms"
            }
        }

    except Exception as e:
        print(f"\n❌ Gemini API Error: {str(e)}")
        print("Full error details:", e)
        return {
            "error": f"Analysis failed: {str(e)}",
            "raw_response": str(e)
        }

    try:
        chat = model.start_chat(history=[{
            "role": "system",
            "content": system_prompt
        }])

        response = chat.send_message()
        
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
    modes = ["genuine", "roast"]
    categories = ["format", "content_quality", "skills_presentation", "ats_compatibility"]
    
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

@app.route('/analyze', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Backend is running"}), 200

@app.route('/analyze', methods=['POST'])
def analyze_resume_endpoint():
    try:
        # Receives file from frontend
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
        
        if not resume_text or resume_text.strip() == "":
            return jsonify({"error": "Could not extract text from the provided file"}), 400

        analysis_result = analyze_resume(resume_text, "both")  # We'll ignore the mode parameter since we're getting both
        
        return jsonify({"analysis": analysis_result})

    except Exception as e:
        print(f"Error in endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)