const express = require('express');
const ListeningLesson = require('../models/ListeningLesson');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// @route   GET /api/listening
// @desc    Get all listening lessons
// @access  Public
router.get('/', async (req, res) => {
  try {
    const lessons = await ListeningLesson.find().sort({ createdAt: -1 });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/listening/:id
// @desc    Get single listening lesson
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const lesson = await ListeningLesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: 'Listening lesson not found' });
    }
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/listening
// @desc    Create a listening lesson (uploads audio to Cloudinary)
// @access  Private (Admin)
router.post('/', protect, admin, upload.single('audio'), async (req, res) => {
  try {
    const { title, transcript, level, duration, category, quiz } = req.body;

    if (!title || !transcript || !category) {
      return res
        .status(400)
        .json({ message: 'title, transcript, and category are required' });
    }

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'Audio file is required' });
    }

    let quizData = [];
    if (quiz) {
      // quiz may arrive as JSON string or object/array
      if (typeof quiz === 'string') {
        try {
          quizData = JSON.parse(quiz);
        } catch (parseErr) {
          return res
            .status(400)
            .json({ message: 'Invalid quiz format. Must be valid JSON.' });
        }
      } else if (Array.isArray(quiz)) {
        quizData = quiz;
      }
    }

    const lesson = await ListeningLesson.create({
      title,
      transcript,
      level,
      duration,
      category,
      quiz: quizData,
      audio: req.file.path, // Cloudinary secure URL
    });

    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

