import requests
import json

# Test resume text
test_resume = """
John Doe
Software Engineer

EXPERIENCE
ABC Company, Senior Developer (2020-Present)
- Led development of company's main product
- Increased performance by 30%

EDUCATION
University of Technology, BS Computer Science (2016-2020)
"""

# Send request to your local API
response = requests.post(
    "http://localhost:5000/analyze",
    json={"resume": test_resume}
)

# Print the response
print("Status code:", response.status_code)
print("Response:")
print(json.dumps(response.json(), indent=2))