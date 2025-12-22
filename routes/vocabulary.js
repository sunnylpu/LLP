const express = require('express');
const Vocabulary = require('../models/Vocabulary');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');
const { updateUserProgress } = require('./progress');

const router = express.Router();

// Helper function to parse sentence into words
const parseSentenceIntoWords = (sentence, language = 'French') => {
  // Remove punctuation and split by spaces
  const words = sentence
    .replace(/[.,!?;:]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0)
    .map(word => word.toLowerCase().trim());

  return words.map(word => ({
    word,
    translation: '', // Can be filled later or by translation API
    language,
    difficulty: 'New',
    category: 'user-added'
  }));
};

// @route   GET /api/vocabulary
// @desc    Get all vocabulary words with enhanced search
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { language, unit, difficulty, search, userId } = req.query;
    const query = {};

    if (language) query.language = language;
    if (unit) query.unit = unit;
    if (difficulty) query.difficulty = difficulty;
    if (userId) query.userId = userId;

    let vocabulary = await Vocabulary.find(query).sort({ createdAt: -1 });

    // Enhanced search: search in both word and translation
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      vocabulary = vocabulary.filter(
        item =>
          searchRegex.test(item.word) ||
          searchRegex.test(item.translation) ||
          (item.category && searchRegex.test(item.category))
      );
    }

    res.json(vocabulary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/vocabulary/search
// @desc    Advanced search for vocabulary
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, language } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchRegex = new RegExp(q, 'i');
    const query = {
      $or: [
        { word: searchRegex },
        { translation: searchRegex },
        { category: searchRegex }
      ]
    };

    if (language) query.language = language;

    const vocabulary = await Vocabulary.find(query)
      .limit(50)
      .sort({ createdAt: -1 });

    res.json(vocabulary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/vocabulary/stats/summary
// @desc    Get vocabulary statistics
// @access  Public
router.get('/stats/summary', async (req, res) => {
  try {
    const { language, userId } = req.query;
    const query = {};
    if (language) query.language = language;
    if (userId) query.userId = userId;

    const total = await Vocabulary.countDocuments(query);
    const byDifficulty = await Vocabulary.aggregate([
      { $match: query },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);
    const byLanguage = await Vocabulary.aggregate([
      { $match: userId ? { userId } : {} },
      { $group: { _id: '$language', count: { $sum: 1 } } }
    ]);

    res.json({
      total,
      byDifficulty: byDifficulty.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byLanguage: byLanguage.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/vocabulary/:id
// @desc    Get single vocabulary word
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findById(req.params.id);
    if (!vocabulary) {
      return res.status(404).json({ message: 'Vocabulary not found' });
    }
    res.json(vocabulary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/vocabulary
// @desc    Create vocabulary word or sentence
// @access  Public (works with or without auth)
router.post('/', async (req, res) => {
  try {
    // Try to get user from token if available, but don't require it
    let userId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          userId = user._id;
        }
      } catch (authError) {
        // User not authenticated, continue without userId
        console.log('User not authenticated, creating vocabulary without userId');
      }
    }

    const { word, sentence, language = 'French' } = req.body;

    // If sentence is provided, parse it into words
    if (sentence) {
      const words = parseSentenceIntoWords(sentence, language);
      const vocabularyItems = await Vocabulary.insertMany(
        words.map(w => ({ ...w, userId }))
      );
      return res.status(201).json({
        message: `Added ${vocabularyItems.length} words from sentence`,
        vocabulary: vocabularyItems
      });
    }

    // Single word creation
    if (!word) {
      return res.status(400).json({ message: 'Word or sentence is required' });
    }

    const vocabulary = await Vocabulary.create({
      word: req.body.word,
      translation: req.body.translation || '',
      language: req.body.language || 'French',
      difficulty: req.body.difficulty || 'New',
      userId: userId,
      unit: req.body.unit || '',
      category: req.body.category || 'user-added'
    });

    // If word is created as "Learned", update user progress
    if (vocabulary.difficulty === 'Learned' && userId) {
      await updateUserProgress(userId, vocabulary.language);
    }

    res.status(201).json(vocabulary);
  } catch (error) {
    console.error('Error creating vocabulary:', error);
    res.status(500).json({
      message: error.message || 'Error creating vocabulary',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @route   POST /api/vocabulary/bulk
// @desc    Bulk create vocabulary words
// @access  Private
router.post('/bulk', protect, async (req, res) => {
  try {
    const { words, language = 'French', userId } = req.body;

    if (!Array.isArray(words) || words.length === 0) {
      return res.status(400).json({ message: 'Words array is required' });
    }

    const vocabularyItems = words.map(word => ({
      word: typeof word === 'string' ? word : word.word,
      translation: word.translation || '',
      language: word.language || language,
      difficulty: word.difficulty || 'New',
      category: word.category || 'user-added',
      userId: userId || req.user?._id
    }));

    const created = await Vocabulary.insertMany(vocabularyItems);

    // Update progress if any words were created as "Learned"
    const targetUserId = userId || req.user?._id;
    if (targetUserId) {
      const learnedWords = created.filter(w => w.difficulty === 'Learned');
      if (learnedWords.length > 0) {
        // Get unique languages from learned words
        const languages = [...new Set(learnedWords.map(w => w.language))];
        for (const lang of languages) {
          await updateUserProgress(targetUserId, lang);
        }
      }
    }

    res.status(201).json({
      message: `Successfully added ${created.length} words`,
      vocabulary: created
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/vocabulary/parse-sentence
// @desc    Parse sentence into words (doesn't save, just returns parsed words)
// @access  Public
router.post('/parse-sentence', async (req, res) => {
  try {
    const { sentence, language = 'French' } = req.body;

    if (!sentence) {
      return res.status(400).json({ message: 'Sentence is required' });
    }

    const words = parseSentenceIntoWords(sentence, language);
    res.json({
      sentence,
      words,
      wordCount: words.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/vocabulary/:id
// @desc    Update vocabulary word
// @access  Public (works with or without auth)
router.put('/:id', async (req, res) => {
  try {
    // Try to get user from token if available, but don't require it
    let userId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          userId = user._id;
        }
      } catch (authError) {
        // User not authenticated, continue without userId
        console.log('User not authenticated, updating vocabulary without userId verification');
      }
    }

    // Get the original vocabulary to check if difficulty changed
    const originalVocabulary = await Vocabulary.findById(req.params.id);

    if (!originalVocabulary) {
      return res.status(404).json({ message: 'Vocabulary not found' });
    }

    // If user is authenticated, verify they own the vocabulary word
    if (userId && originalVocabulary.userId && originalVocabulary.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this vocabulary word' });
    }

    const vocabulary = await Vocabulary.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // If difficulty changed to/from "Learned", update user progress
    if (originalVocabulary &&
      (originalVocabulary.difficulty !== vocabulary.difficulty) &&
      (vocabulary.difficulty === 'Learned' || originalVocabulary.difficulty === 'Learned') &&
      vocabulary.userId) {
      await updateUserProgress(vocabulary.userId, vocabulary.language);
    }

    res.json(vocabulary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/vocabulary/:id
// @desc    Delete vocabulary word
// @access  Public (works with or without auth)
router.delete('/:id', async (req, res) => {
  try {
    // Try to get user from token if available, but don't require it
    let userId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          userId = user._id;
        }
      } catch (authError) {
        // User not authenticated, continue without userId
        console.log('User not authenticated, deleting vocabulary without userId verification');
      }
    }

    // Find the vocabulary word first to check ownership
    const vocabulary = await Vocabulary.findById(req.params.id);
    if (!vocabulary) {
      return res.status(404).json({ message: 'Vocabulary not found' });
    }

    // If user is authenticated, verify they own the vocabulary word
    if (userId && vocabulary.userId && vocabulary.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this vocabulary word' });
    }

    // Delete the vocabulary word
    await Vocabulary.findByIdAndDelete(req.params.id);

    res.json({ message: 'Vocabulary deleted successfully', vocabulary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/vocabulary
// @desc    Delete multiple vocabulary words
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Array of IDs is required' });
    }

    const result = await Vocabulary.deleteMany({ _id: { $in: ids } });
    res.json({
      message: `Deleted ${result.deletedCount} vocabulary items`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/vocabulary/generate-ai
// @desc    Generate vocabulary using AI (Gemini)
// @access  Public
router.post('/generate-ai', async (req, res) => {
  try {
    const { prompt, language = 'French' } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    // Check if Gemini API key is configured
    if (!process.env.API_CHAT) {
      return res.status(500).json({
        message: 'AI service is not configured. Please contact administrator.'
      });
    }

    // Import Gemini AI
    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.API_CHAT });

    // Create a strict prompt that only allows vocabulary generation
    const systemPrompt = `You are a vocabulary generation assistant for a language learning platform.

STRICT RULES:
1. You MUST ONLY respond to requests about generating vocabulary words, translations, or language learning content.
2. If the user asks anything that is NOT about vocabulary, words, translations, or language learning, respond with: "I can only help generate vocabulary words. Please ask for vocabulary-related content."
3. Generate vocabulary in a structured JSON format ONLY.
4. Do not answer general knowledge questions, math problems, or any non-vocabulary requests.

User's request: "${prompt}"
Target language: ${language}

If this is a vocabulary request, generate 5-10 vocabulary words in JSON format like this:
[
  {
    "word": "word in ${language}",
    "translation": "translation in English",
    "language": "${language}",
    "difficulty": "New"
  }
]

If this is NOT a vocabulary request, respond with the rejection message stated in rule 2.`;

    // Call Gemini API
    console.log('Calling Gemini API with prompt:', prompt);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: systemPrompt }]
        }
      ]
    });

    console.log('Gemini API response received');
    let aiResponse = response.candidates[0].content.parts[0].text;
    console.log('Raw AI response:', aiResponse);

    // Check if AI rejected the request (non-vocabulary question)
    if (aiResponse.includes('I can only help generate vocabulary words')) {
      return res.status(400).json({
        message: 'Please ask for vocabulary-related content only. I can help you generate vocabulary words, translations, or language learning content.',
        isRestricted: true
      });
    }

    // Clean up the response (remove markdown code blocks if present)
    aiResponse = aiResponse.replace(/^```json\s*/gm, '').replace(/```$/gm, '').trim();
    console.log('Cleaned AI response:', aiResponse);

    // Try to parse as JSON
    let vocabularyData;
    try {
      vocabularyData = JSON.parse(aiResponse);

      // Ensure it's an array
      if (!Array.isArray(vocabularyData)) {
        throw new Error('Response is not an array');
      }

      // Validate each vocabulary item
      vocabularyData = vocabularyData.map(item => ({
        word: item.word || '',
        translation: item.translation || '',
        language: item.language || language,
        difficulty: item.difficulty || 'New',
        category: 'ai-generated'
      }));

      console.log('Successfully parsed vocabulary data:', vocabularyData.length, 'words');

    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('AI response that failed to parse:', aiResponse);
      return res.status(500).json({
        message: 'Failed to generate vocabulary. Please try again with a different request.',
        error: 'Invalid AI response format'
      });
    }

    res.json({
      success: true,
      vocabulary: vocabularyData,
      count: vocabularyData.length
    });

  } catch (error) {
    console.error('Error generating AI vocabulary:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      message: 'Failed to generate vocabulary. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

