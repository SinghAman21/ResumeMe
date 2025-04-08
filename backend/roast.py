import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import pdfplumber
import docx
import tempfile
from resume_analyzer import analyze_resume

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
# app.config["UPLOAD_FOLDER"] = "uploads"
# os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
# the above commented code is to create temp folder for resume for proccessing it 
# but now theres no need, why ?? using tempfile module from python 

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

        # Get mode from request
        mode = request.form.get('mode', 'genuine')
        
        # Analyze resume using Gemini
        analysis_result = analyze_resume(resume_text, mode)
        
        return jsonify({"analysis": analysis_result})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
