const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

// Single reliable API → MyMemory (no key needed)
router.post("/", async (req, res) => {
  const { word, sourceLang, targetLang } = req.body || {};

  if (!word || !sourceLang || !targetLang) {
    return res.status(400).json({
      message: "word, sourceLang, and targetLang are required",
    });
  }

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      word
    )}&langpair=${sourceLang}|${targetLang}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data?.responseData?.translatedText) {
      return res.status(500).json({ message: "Invalid translation response" });
    }

    return res.json({
      translatedText: data.responseData.translatedText,
      provider: "MyMemory",
    });
  } catch (error) {
    console.error("Translation failed:", error);
    return res
      .status(503)
      .json({ message: "Translation failed", error: error.message });
  }
});

module.exports = router;
