const express = require('express');
const fetch = require('node-fetch');

const router = express.Router();

// Valid, working servers only (no de.libretranslate.com)
const TRANSLATE_SERVERS = [
  'https://translate.argosopentech.com/translate', // primary
  'https://libretranslate.de/translate', // secondary
];

const fetchWithTimeout = async (url, options, timeoutMs = 10000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const translateViaServer = async (url, payload) => {
  const bodyString = JSON.stringify(payload); // fresh body per request to avoid reuse issues
  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: bodyString,
  });

  const rawText = await response.text(); // read once to avoid stream reuse errors

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${rawText.slice(0, 200)}`);
  }

  let data;
  try {
    data = JSON.parse(rawText);
  } catch (parseErr) {
    throw new Error(`Invalid JSON response: ${rawText.slice(0, 200) || 'unknown'}`);
  }

  if (!data || typeof data.translatedText !== 'string') {
    throw new Error('Missing translatedText in response');
  }

  return data.translatedText;
};

// @route   POST /api/translate
// @desc    Proxy translation to LibreTranslate/Argos with fallback to avoid CORS issues
// @access  Public
router.post('/', async (req, res) => {
  const { word, sourceLang, targetLang } = req.body || {};

  if (!word || !sourceLang || !targetLang) {
    return res
      .status(400)
      .json({ message: 'word, sourceLang, and targetLang are required' });
  }

  const payload = {
    q: word,
    source: sourceLang,
    target: targetLang,
    format: 'text',
  };

  const errors = [];

  for (const serverUrl of TRANSLATE_SERVERS) {
    try {
      const translatedText = await translateViaServer(serverUrl, payload);
      return res.json({ translatedText, provider: serverUrl });
    } catch (err) {
      console.error(`Translation failed via ${serverUrl}:`, err.message);
      errors.push({ server: serverUrl, error: err.message });
    }
  }

  return res.status(503).json({
    message: 'All translation services failed',
    errors,
  });
});

module.exports = router;

