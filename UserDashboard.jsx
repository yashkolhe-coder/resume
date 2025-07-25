import { useState } from "react";
import axios from "axios";

export default function UserDashboard() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setAnalysis(null);
    if (!file) {
      setError("Please select a file.");
      return;
    }
    const formData = new FormData();
    formData.append("resume", file);
    try {
      const res = await axios.post("http://localhost:5000/api/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed");
    }
  };

  const handleAnalyze = async () => {
    setAnalysis(null);
    if (!result?.raw_text) return;
    try {
      const res = await axios.post("http://localhost:5000/api/resume/analyze", { text: result.raw_text }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setAnalysis(res.data.analysis);
    } catch (err) {
      setAnalysis("Analysis failed.");
    }
  };

  return (
    <div>
      <h2>User Dashboard</h2>
      <form onSubmit={handleUpload}>
        <input type="file" accept=".pdf,.docx" onChange={e => setFile(e.target.files[0])} />
        <button type="submit">Upload Resume</button>
      </form>
      {error && <div style={{color: "red"}}>{error}</div>}
      {result && (
        <div style={{marginTop: 20}}>
          <h3>Parsed Resume Fields:</h3>
          <ul>
            <li><strong>Name:</strong> {result.name || "-"}</li>
            <li><strong>Email:</strong> {result.email || "-"}</li>
            <li><strong>Phone:</strong> {result.phone || "-"}</li>
            <li><strong>Education:</strong>
              <ul>{result.education && result.education.length ? result.education.map((e, i) => <li key={i}>{e}</li>) : <li>-</li>}</ul>
            </li>
            <li><strong>Experience:</strong>
              <ul>{result.experience && result.experience.length ? result.experience.map((e, i) => <li key={i}>{e}</li>) : <li>-</li>}</ul>
            </li>
            <li><strong>Skills:</strong>
              <ul>{result.skills && result.skills.length ? result.skills.map((s, i) => <li key={i}>{s}</li>) : <li>-</li>}</ul>
            </li>
            <li><strong>Certifications:</strong>
              <ul>{result.certifications && result.certifications.length ? result.certifications.map((c, i) => <li key={i}>{c}</li>) : <li>-</li>}</ul>
            </li>
          </ul>
          <button onClick={handleAnalyze} style={{marginTop: 10}}>Analyze Resume (AI)</button>
          {analysis && (
            <div style={{marginTop: 20}}>
              <h3>AI Analysis:</h3>
              <pre>{analysis}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 