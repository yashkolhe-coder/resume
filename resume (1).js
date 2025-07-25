const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const Resume = require('../models/Resume');
const auth = (req, res, next) => { next(); }; // Placeholder for JWT middleware

// Save uploaded and parsed resume
router.post('/upload', auth, upload.single('resume'), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append('resume', fs.createReadStream(req.file.path), req.file.originalname);
    const aiRes = await axios.post('http://localhost:5001/parse', formData, {
      headers: formData.getHeaders()
    });
    fs.unlinkSync(req.file.path); // Clean up uploaded file
    const parsed = aiRes.data;
    // Save to DB (replace req.user.id with a real user id when JWT is implemented)
    const newResume = new Resume({
      user: req.user && req.user.id ? req.user.id : null, // Replace with real user id
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone,
      education: parsed.education,
      experience: parsed.experience,
      skills: parsed.skills,
      certifications: parsed.certifications,
      raw_text: parsed.raw_text
    });
    await newResume.save();
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: 'Resume parsing failed' });
  }
});

// Fetch all resumes for the logged-in user
router.get('/my', auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user && req.user.id ? req.user.id : null }).sort({ createdAt: -1 });
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

router.post('/analyze', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const aiRes = await axios.post('http://localhost:5001/analyze', { text });
    res.json(aiRes.data);
  } catch (err) {
    res.status(500).json({ error: 'Resume analysis failed' });
  }
});

module.exports = router; 