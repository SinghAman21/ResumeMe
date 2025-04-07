import os
import google.generativeai as genai
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2
import docx
import tempfile

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config["UPLOAD_FOLDER"] = "uploads"
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
# Load environment variables

load_dotenv()

# Configure the API key
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

# Create the model
generation_config = {
    "temperature": 0.9,  # Slightly reduced for more consistent output
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}

# Enhanced system instructions for detailed resume roasting
system_instructions = """You are ResumeRoast AI, a brutally honest but professional resume critic. Your task is to:

1. Analyze the resume thoroughly and provide feedback in the following categories:
   - Content & Impact (clarity of achievements, quantifiable results)
   - Format & Structure (layout, organization, readability)
   - Language & Grammar (word choice, professionalism)
   - Overall Impact (competitiveness, effectiveness)

2. For each category:
   - Provide a score out of 10
   - List specific issues found
   - Give actionable improvements

3. Format your response as JSON with the following structure:
{
    "overall_score": <number>,
    "categories": [
        {
            "name": "<category name>",
            "score": <number>,
            "issues": ["<issue 1>", "<issue 2>", ...],
            "improvements": ["<improvement 1>", "<improvement 2>", ...]
        },
        ...
    ],
    "summary": "<brief overall assessment>"
}

Be direct, specific, and constructive in your feedback. Don't sugarcoat issues, but maintain professionalism."""

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
        with open(temp_file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
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

@app.route('/analyze', methods=['POST'])
def analyze_resume():
    try:
        if 'resume' in request.json:
            # Handle text input
            resume_text = request.json.get('resume')
        elif 'file' in request.files:
            # Handle file upload
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

        chat_session = model.start_chat(
            history=[{
                "role": "system",
                "content": system_instructions
            }]
        )

        response = chat_session.send_message(resume_text)
        return jsonify({"analysis": response.text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
