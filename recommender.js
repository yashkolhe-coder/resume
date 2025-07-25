const express = require('express');
const router = express.Router();
const jobs = require('../data/onet_jobs.json');

// Recommend jobs based on user's skills
router.post('/recommend', (req, res) => {
  const { skills } = req.body; // Array of user skills
  if (!skills || !Array.isArray(skills)) {
    return res.status(400).json({ error: 'Skills array required' });
  }

  // Simple skill match: count overlapping skills
  const recommendations = jobs.map(job => {
    const matchCount = job.skills.filter(skill => skills.some(userSkill =>
      userSkill.toLowerCase() === skill.toLowerCase()
    )).length;
    return { ...job, matchCount };
  }).filter(job => job.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount);

  res.json(recommendations);
});

module.exports = router; 