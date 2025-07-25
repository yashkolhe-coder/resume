from flask import Flask, request, jsonify
import pdfplumber
import docx2txt
import os
import openai
import re

app = Flask(__name__)

openai.api_key = os.getenv("OPENAI_API_KEY")  # Set your OpenAI API key as an environment variable

def parse_pdf(file_path):
    with pdfplumber.open(file_path) as pdf:
        text = "\n".join(page.extract_text() or "" for page in pdf.pages)
    return {"text": text}

def parse_docx(file_path):
    text = docx2txt.process(file_path)
    return {"text": text}

def extract_fields(text):
    lines = text.splitlines()
    name = lines[0].strip() if lines else ""
    email_match = re.search(r"[\w\.-]+@[\w\.-]+", text)
    email = email_match.group(0) if email_match else ""
    phone_match = re.search(r"(\+?\d[\d\s\-]{8,}\d)", text)
    phone = phone_match.group(0) if phone_match else ""
    education = [line.strip() for line in lines if any(word in line.lower() for word in ["bachelor", "master", "phd", "university", "college", "school", "degree"])]
    experience = [line.strip() for line in lines if any(word in line.lower() for word in ["experience", "intern", "company", "developer", "engineer", "manager", "analyst", "consultant"])]
    skills = []
    skill_section = False
    for line in lines:
        if "skill" in line.lower():
            skill_section = True
            continue
        if skill_section:
            if line.strip() == "" or len(line.strip()) < 2:
                break
            skills.extend([s.strip() for s in re.split(r",|\|", line) if s.strip()])
    certifications = [line.strip() for line in lines if "certification" in line.lower() or "certified" in line.lower()]
    return {
        "name": name,
        "email": email,
        "phone": phone,
        "education": education,
        "experience": experience,
        "skills": skills,
        "certifications": certifications
    }

@app.route('/parse', methods=['POST'])
def parse_resume():
    if 'resume' not in request.files:
        return jsonify({"error": "No file"}), 400
    file = request.files['resume']
    ext = os.path.splitext(file.filename)[1].lower()
    file_path = f"/tmp/{file.filename}"
    file.save(file_path)
    if ext == ".pdf":
        data = parse_pdf(file_path)
    elif ext == ".docx":
        data = parse_docx(file_path)
    else:
        os.remove(file_path)
        return jsonify({"error": "Unsupported file type"}), 400
    os.remove(file_path)
    fields = extract_fields(data["text"])
    return jsonify({**fields, "raw_text": data["text"]})

@app.route('/analyze', methods=['POST'])
def analyze_resume():
    data = request.json
    resume_text = data.get('text')
    if not resume_text:
        return jsonify({"error": "No resume text provided"}), 400

    prompt = (
        "You are an expert resume reviewer. Analyze the following resume text for:\n"
        "- Grammar and spelling\n"
        "- Tone and professionalism\n"
        "- Formatting and structure\n"
        "- ATS (Applicant Tracking System) compatibility\n"
        "- Skill match for common job roles\n"
        "Provide:\n"
        "1. ATS Score (0-100)\n"
        "2. Grammar Score (0-100)\n"
        "3. Skill Match Score (0-100)\n"
        "4. Suggestions for improvement\n"
        "5. List of missing or weak skills\n"
        "Resume:\n"
        f"{resume_text}\n"
    )

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
            temperature=0.3,
        )
        analysis = response.choices[0].message.content
        return jsonify({"analysis": analysis})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001, debug=True) 