import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure the API key
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

# Create the model configuration
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
)

def start_cli():
    print("Welcome to Gemini CLI!")
    print("Type 'exit' to quit.")
    
    system_instructions = input("Enter system instructions (optional): ")
    
    chat_session = model.start_chat(
        history=[{
            "role": "system",
            "parts": [{"text": system_instructions}]
        }]
    )
    
    while True:
        user_input = input("You: ")
        if user_input.lower() == 'exit':
            print("Exiting Gemini CLI. Goodbye!")
            break
        
        response = chat_session.send_message(user_input)
        print(f"Gemini: {response.text}")

if __name__ == "__main__":
    start_cli()
