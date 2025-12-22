import React, { useState, useEffect } from 'react';
import { getVocabulary, deleteVocabulary, updateVocabulary, generateAIVocabulary, createVocabulary, awardXP } from '../utils/api';
import './Vocabulary.css';

const Vocabulary = ({ language = 'French', unit = 'Unit 3', vocabulary: propVocabulary, onVocabularyUpdate }) => {
  const [vocabulary, setVocabulary] = useState(propVocabulary || []);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(!propVocabulary);
  const [practicingWord, setPracticingWord] = useState(null);
  const [recognitionResult, setRecognitionResult] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [listeningForWord, setListeningForWord] = useState(null);

  // AI vocabulary generation states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLanguage, setAiLanguage] = useState(language);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [generatedVocabulary, setGeneratedVocabulary] = useState([]);
  const [selectedVocab, setSelectedVocab] = useState(new Set());

  // Gamification tracking
  const [practiceSessionStart, setPracticeSessionStart] = useState(null);
  const [wordsReviewedInSession, setWordsReviewedInSession] = useState(0);

  useEffect(() => {
    if (propVocabulary) {
      setVocabulary(propVocabulary);
      setLoading(false);
    } else {
      fetchVocabulary();
    }
  }, [propVocabulary, language, unit, filter]);

  const fetchVocabulary = async () => {
    try {
      setLoading(true);
      const filters = {
        language,
        ...(unit && { unit }),
        ...(filter === 'New Words' && { difficulty: 'New' }),
        ...(filter === 'Difficult Words' && { difficulty: 'Difficult' }),
        ...(filter === 'Learned Words' && { difficulty: 'Learned' }),
      };
      const data = await getVocabulary(filters);
      setVocabulary(data);
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVocabulary = vocabulary.filter((word) => {
    // Filter by difficulty
    if (filter === 'New Words' && word.difficulty !== 'New') return false;
    if (filter === 'Difficult Words' && word.difficulty !== 'Difficult') return false;
    if (filter === 'Learned Words' && word.difficulty !== 'Learned') return false;

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const wordMatch = word.word?.toLowerCase().includes(searchLower);
      const translationMatch = word.translation?.toLowerCase().includes(searchLower);
      if (!wordMatch && !translationMatch) return false;
    }

    return true;
  });

  const newWordsCount = vocabulary.filter((w) => w.difficulty === 'New').length;
  const difficultWordsCount = vocabulary.filter((w) => w.difficulty === 'Difficult').length;
  const learnedWordsCount = vocabulary.filter((w) => w.difficulty === 'Learned').length;
  const totalWords = vocabulary.length;
  const learnedProgress = totalWords > 0 ? (learnedWordsCount / totalWords) * 100 : 0;

  const playAudio = (audioUrl) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  // Pronunciation function using Web Speech API
  const speakWord = (word, lang = language) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      // Map language names to language codes
      const languageMap = {
        'French': 'fr-FR',
        'Spanish': 'es-ES',
        'German': 'de-DE',
        'Italian': 'it-IT',
        'English': 'en-US'
      };

      const langCode = languageMap[lang] || 'en-US';

      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = langCode;
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1;
      utterance.volume = 1;

      // Try to find a voice that matches the language
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice =>
        voice.lang.startsWith(langCode.split('-')[0])
      );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Speech synthesis is not supported in your browser');
    }
  };

  // Combined speak and listen function for pronunciation feedback
  const speakAndListen = (word, lang = language, wordObj) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in your browser');
      return;
    }

    const RecognitionClass = getSpeechRecognition();
    if (!RecognitionClass) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Map language names to language codes
    const languageMap = {
      'French': 'fr-FR',
      'Spanish': 'es-ES',
      'German': 'de-DE',
      'Italian': 'it-IT',
      'English': 'en-US'
    };

    const langCode = languageMap[lang] || 'en-US';

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = langCode;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to find a voice that matches the language
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice =>
      voice.lang.startsWith(langCode.split('-')[0])
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // After speech ends, start listening
    utterance.onend = () => {
      // Wait a brief moment before starting recognition
      setTimeout(() => {
        setListeningForWord(wordObj._id);
        setIsListening(true);

        const recognition = new RecognitionClass();
        recognition.lang = langCode;
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
          const spokenText = event.results[0][0].transcript.trim();
          const expectedWord = word.trim();
          const similarity = calculateSimilarity(spokenText, expectedWord);

          const result = {
            spoken: spokenText,
            expected: expectedWord,
            similarity: similarity,
            isCorrect: similarity >= 80,
            isClose: similarity >= 60 && similarity < 80
          };

          setFeedbackData(result);
          setShowFeedbackModal(true);
          setIsListening(false);
          setListeningForWord(null);

          // Track pronunciation practice for gamification
          trackPronunciationPractice(result.similarity);

          // Auto-update difficulty if correct
          if (result.isCorrect && wordObj.difficulty === 'New') {
            handleDifficultyChange(wordObj._id, 'Learned');
          }
        };

        recognition.onerror = (event) => {
          setIsListening(false);
          setListeningForWord(null);

          let errorMessage = 'Speech recognition error: ';
          switch (event.error) {
            case 'no-speech':
              errorMessage = 'No speech detected. Please try again.';
              break;
            case 'audio-capture':
              errorMessage = 'No microphone found. Please check your microphone.';
              break;
            case 'not-allowed':
              errorMessage = 'Microphone permission denied. Please allow microphone access.';
              break;
            default:
              errorMessage += event.error;
          }

          setFeedbackData({
            isError: true,
            error: errorMessage,
            spoken: '',
            expected: word,
            similarity: 0
          });
          setShowFeedbackModal(true);
        };

        recognition.onend = () => {
          setIsListening(false);
          setListeningForWord(null);
        };

        try {
          recognition.start();
        } catch (error) {
          console.error('Error starting recognition:', error);
          setIsListening(false);
          setListeningForWord(null);
        }
      }, 500); // Brief pause after speech ends
    };

    window.speechSynthesis.speak(utterance);
  };

  // Helper function to track pronunciation practice
  const trackPronunciationPractice = async (accuracy) => {
    try {
      // Start session if not already started
      if (!practiceSessionStart) {
        setPracticeSessionStart(Date.now());
      }

      // Increment words reviewed
      const newWordsReviewed = wordsReviewedInSession + 1;
      setWordsReviewedInSession(newWordsReviewed);

      // Award XP for pronunciation practice (every 3 words or high accuracy)
      if (newWordsReviewed % 3 === 0 || accuracy >= 80) {
        const sessionDuration = practiceSessionStart ? Math.floor((Date.now() - practiceSessionStart) / 1000) : 0;

        await awardXP({
          activityType: 'vocabulary',
          duration: sessionDuration,
          wordsReviewed: newWordsReviewed,
          accuracy: accuracy,
          perfectRecalls: accuracy >= 95 ? 1 : 0
        });

        // Reset session tracking after awarding XP
        setPracticeSessionStart(Date.now());
        setWordsReviewedInSession(0);
      }
    } catch (error) {
      console.error('Error tracking pronunciation practice:', error);
    }
  };

  // Load voices when component mounts
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Chrome loads voices asynchronously
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  // Check if speech recognition is available and get the constructor
  const getSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      return window.webkitSpeechRecognition;
    } else if ('SpeechRecognition' in window) {
      return window.SpeechRecognition;
    }
    return null;
  };

  // Calculate similarity between two strings (Levenshtein distance based)
  const calculateSimilarity = (str1, str2) => {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 100;

    // Exact match after normalization
    if (s1.replace(/[.,!?;:]/g, '') === s2.replace(/[.,!?;:]/g, '')) {
      return 95;
    }

    // Check if one contains the other
    if (s1.includes(s2) || s2.includes(s1)) {
      return 80;
    }

    // Calculate Levenshtein distance
    const len1 = s1.length;
    const len2 = s2.length;
    const matrix = [];

    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    const distance = matrix[len2][len1];
    const maxLen = Math.max(len1, len2);
    const similarity = ((maxLen - distance) / maxLen) * 100;

    return Math.max(0, Math.round(similarity));
  };

  // Practice pronunciation with speech recognition
  const practicePronunciation = (wordObj, wordLanguage = language) => {
    const RecognitionClass = getSpeechRecognition();

    if (!RecognitionClass) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    setPracticingWord(wordObj._id);
    setIsListening(true);
    setRecognitionResult(null);

    // Map language names to language codes
    const languageMap = {
      'French': 'fr-FR',
      'Spanish': 'es-ES',
      'German': 'de-DE',
      'Italian': 'it-IT',
      'English': 'en-US'
    };

    const recognition = new RecognitionClass();
    recognition.lang = languageMap[wordLanguage] || 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript.trim();
      const expectedWord = wordObj.word.trim();
      const similarity = calculateSimilarity(spokenText, expectedWord);

      let result = {
        spoken: spokenText,
        expected: expectedWord,
        similarity: similarity,
        isCorrect: similarity >= 80,
        isClose: similarity >= 60 && similarity < 80
      };

      setRecognitionResult(result);
      setIsListening(false);

      // Auto-update difficulty if correct
      if (result.isCorrect && wordObj.difficulty === 'New') {
        handleDifficultyChange(wordObj._id, 'Learned');
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setPracticingWord(null);

      let errorMessage = 'Speech recognition error: ';
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found. Please check your microphone.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please allow microphone access.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = `Error: ${event.error}`;
      }

      setRecognitionResult({
        error: errorMessage,
        isError: true
      });
    };

    recognition.onend = () => {
      setIsListening(false);
      // Clear feedback after 5 seconds if no result was set
      setTimeout(() => {
        setRecognitionResult(prev => {
          if (prev && !prev.isError) {
            // Keep correct/incorrect results visible longer
            return prev;
          }
          return null;
        });
        if (!recognitionResult || recognitionResult?.isError) {
          setPracticingWord(null);
        }
      }, 5000);
    };

    try {
      recognition.start();
    } catch (error) {
      setIsListening(false);
      setPracticingWord(null);
      setRecognitionResult({
        error: 'Failed to start speech recognition. Please try again.',
        isError: true
      });
    }
  };

  const handleDelete = async (id) => {
    console.log('handleDelete called with id:', id);

    if (!window.confirm('Are you sure you want to delete this word?')) {
      return;
    }

    try {
      console.log('Attempting to delete vocabulary with id:', id);
      await deleteVocabulary(id);
      const updatedVocabulary = vocabulary.filter(item => item._id !== id);
      setVocabulary(updatedVocabulary);
      if (onVocabularyUpdate) {
        onVocabularyUpdate();
      }
      console.log('Successfully deleted vocabulary');
    } catch (error) {
      console.error('Error deleting vocabulary:', error);
      alert('Error deleting word');
    }
  };

  const handleDifficultyChange = async (id, newDifficulty) => {
    try {
      const oldWord = vocabulary.find(item => item._id === id);
      const oldDifficulty = oldWord?.difficulty;

      await updateVocabulary(id, { difficulty: newDifficulty });
      const updatedVocabulary = vocabulary.map(item =>
        item._id === id ? { ...item, difficulty: newDifficulty } : item
      );
      setVocabulary(updatedVocabulary);

      // Track gamification activity
      try {
        // Award XP when word is learned or reviewed
        const wordsLearned = (oldDifficulty === 'New' && newDifficulty === 'Learned') ? 1 : 0;
        const wordsReviewed = (oldDifficulty !== 'New' && newDifficulty === 'Learned') ? 1 : 0;

        if (wordsLearned > 0 || wordsReviewed > 0) {
          await awardXP({
            activityType: 'vocabulary',
            wordsLearned,
            wordsReviewed,
            perfectRecalls: newDifficulty === 'Learned' ? 1 : 0
          });
        }
      } catch (gamificationError) {
        // Don't fail the main operation if gamification tracking fails
        console.error('Error tracking gamification:', gamificationError);
      }
    } catch (error) {
      console.error('Error updating vocabulary:', error);
    }
  };

  // AI Vocabulary Generation
  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) {
      setAiError('Please enter what vocabulary you want to generate');
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setGeneratedVocabulary([]);
    setSelectedVocab(new Set());

    try {
      const response = await generateAIVocabulary(aiPrompt, aiLanguage);
      setGeneratedVocabulary(response.vocabulary);
      // Auto-select all generated vocabulary
      setSelectedVocab(new Set(response.vocabulary.map((_, index) => index)));
    } catch (error) {
      console.error('Error generating AI vocabulary:', error);
      const errorMessage = error.response?.data?.message || 'Failed to generate vocabulary. Please try again.';
      setAiError(errorMessage);
    } finally {
      setAiLoading(false);
    }
  };

  const toggleVocabSelection = (index) => {
    const newSelected = new Set(selectedVocab);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedVocab(newSelected);
  };

  const handleAddSelectedVocabulary = async () => {
    const selectedWords = generatedVocabulary.filter((_, index) => selectedVocab.has(index));

    if (selectedWords.length === 0) {
      setAiError('Please select at least one vocabulary word to add');
      return;
    }

    try {
      // Add each selected word to the vocabulary
      for (const word of selectedWords) {
        await createVocabulary({
          word: word.word,
          translation: word.translation,
          language: word.language,
          difficulty: word.difficulty,
          category: 'ai-generated'
        });
      }

      // Refresh vocabulary list
      await fetchVocabulary();

      // Clear AI section
      setGeneratedVocabulary([]);
      setSelectedVocab(new Set());
      setAiPrompt('');
      setAiError(null);

      alert(`Successfully added ${selectedWords.length} vocabulary word(s)!`);
    } catch (error) {
      console.error('Error adding vocabulary:', error);
      setAiError('Failed to add vocabulary words. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading vocabulary...</div>;
  }

  return (
    <div className="vocabulary-page">
      <div className="vocabulary-container">
        {/* AI Vocabulary Generator Section */}
        <div className="ai-vocabulary-section">
          <h2 className="ai-section-title">
            🤖 Ask AI to Generate Vocabulary
          </h2>
          <p className="ai-section-description">
            Describe what vocabulary you want to learn, and AI will generate relevant words for you.
            For example: "10 French words about food" or "Spanish greetings"
          </p>

          <div className="ai-input-container">
            <div className="ai-input-group">
              <input
                type="text"
                className="ai-input"
                placeholder="e.g., 10 French words about travel"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGenerateAI()}
              />
            </div>
            <select
              className="ai-language-select"
              value={aiLanguage}
              onChange={(e) => setAiLanguage(e.target.value)}
            >
              <option value="French">French</option>
              <option value="Spanish">Spanish</option>
              <option value="German">German</option>
              <option value="Italian">Italian</option>
              <option value="English">English</option>
            </select>
            <button
              className="ai-generate-button"
              onClick={handleGenerateAI}
              disabled={aiLoading}
            >
              {aiLoading ? 'Generating...' : '✨ Generate'}
            </button>
          </div>

          {aiLoading && (
            <div className="ai-loading">
              <div className="ai-loading-spinner"></div>
              AI is generating vocabulary for you...
            </div>
          )}

          {aiError && (
            <div className="ai-error">
              ⚠️ {aiError}
            </div>
          )}

          {generatedVocabulary.length > 0 && (
            <div className="ai-generated-vocabulary">
              <h3 className="ai-generated-title">
                ✅ Generated Vocabulary (Click to select/deselect)
              </h3>
              <div className="ai-vocabulary-grid">
                {generatedVocabulary.map((vocab, index) => (
                  <div
                    key={index}
                    className={`ai-vocabulary-card ${selectedVocab.has(index) ? 'selected' : ''}`}
                    onClick={() => toggleVocabSelection(index)}
                  >
                    <h4 className="ai-vocab-word">{vocab.word}</h4>
                    <p className="ai-vocab-translation">{vocab.translation}</p>
                    {selectedVocab.has(index) && (
                      <div className="ai-vocab-checkbox">✓ Selected</div>
                    )}
                  </div>
                ))}
              </div>
              <button
                className="ai-add-selected-button"
                onClick={handleAddSelectedVocabulary}
                disabled={selectedVocab.size === 0}
              >
                Add {selectedVocab.size} Selected Word{selectedVocab.size !== 1 ? 's' : ''} to My Vocabulary
              </button>
            </div>
          )}
        </div>

        <div className="vocabulary-header">
          <h1 className="vocabulary-title">
            {unit ? `My Vocabulary: ${language} ${unit}` : `My Vocabulary: ${language}`}
          </h1>
          <div className="progress-info">
            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{ width: `${learnedProgress}%` }}
              ></div>
            </div>
            <p className="progress-text">
              You've learned {learnedWordsCount} of {totalWords} words
            </p>
          </div>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Find a word or sentence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-tabs">
          <button
            className={`tab ${filter === 'All' ? 'active' : ''}`}
            onClick={() => setFilter('All')}
          >
            All Words ({totalWords})
          </button>
          <button
            className={`tab ${filter === 'New Words' ? 'active' : ''}`}
            onClick={() => setFilter('New Words')}
          >
            New Words ({newWordsCount})
          </button>
          <button
            className={`tab ${filter === 'Difficult Words' ? 'active' : ''}`}
            onClick={() => setFilter('Difficult Words')}
          >
            Difficult Words ({difficultWordsCount})
          </button>
          <button
            className={`tab ${filter === 'Learned Words' ? 'active' : ''}`}
            onClick={() => setFilter('Learned Words')}
          >
            Learned Words ({learnedWordsCount})
          </button>
        </div>

        <div className="vocabulary-grid">
          {filteredVocabulary.map((word) => (
            <div key={word._id} className="vocabulary-card">
              {word.image && (
                <div className="vocabulary-image">
                  <img src={word.image} alt={word.word} />
                </div>
              )}
              <div className="vocabulary-content">
                <div className="vocabulary-header-card">
                  <h3 className="vocabulary-word">{word.word}</h3>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(word._id)}
                    title="Delete word"
                  >
                    ✕
                  </button>
                </div>
                {word.translation && (
                  <p className="vocabulary-translation">{word.translation}</p>
                )}

                {/* Speech Recognition Feedback */}
                {practicingWord === word._id && recognitionResult && (
                  <div className={`recognition-feedback ${recognitionResult.isError ? 'error' : recognitionResult.isCorrect ? 'correct' : recognitionResult.isClose ? 'close' : 'incorrect'}`}>
                    {recognitionResult.isError ? (
                      <p className="feedback-message">❌ {recognitionResult.error}</p>
                    ) : (
                      <>
                        <p className="feedback-message">
                          {recognitionResult.isCorrect ? '✅ Correct!' : recognitionResult.isClose ? '⚠️ Close!' : '❌ Incorrect'}
                        </p>
                        <p className="feedback-details">
                          You said: <strong>"{recognitionResult.spoken}"</strong>
                        </p>
                        <p className="feedback-similarity">
                          Similarity: {recognitionResult.similarity}%
                        </p>
                      </>
                    )}
                  </div>
                )}

                <div className="vocabulary-actions">
                  <button
                    className={`pronounce-button ${listeningForWord === word._id ? 'listening' : ''}`}
                    onClick={() => speakAndListen(word.word, word.language || language, word)}
                    title="Listen and practice pronunciation"
                    disabled={listeningForWord === word._id}
                  >
                    {listeningForWord === word._id ? '🎤' : '🔊'}
                  </button>
                  {word.audioUrl && (
                    <button
                      className="audio-button"
                      onClick={() => playAudio(word.audioUrl)}
                      title="Play audio file"
                    >
                      🎵
                    </button>
                  )}
                  <select
                    className="difficulty-select"
                    value={word.difficulty || 'New'}
                    onChange={(e) => handleDifficultyChange(word._id, e.target.value)}
                    title="Change difficulty"
                  >
                    <option value="New">New</option>
                    <option value="Difficult">Difficult</option>
                    <option value="Learned">Learned</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredVocabulary.length === 0 && (
          <div className="no-results">
            {vocabulary.length === 0
              ? 'No vocabulary words yet. Start adding words or sentences above!'
              : 'No vocabulary words found. Try adjusting your search or filter.'}
          </div>
        )}
      </div>

      {/* Pronunciation Feedback Modal */}
      {showFeedbackModal && feedbackData && (
        <div className="feedback-modal-overlay" onClick={() => setShowFeedbackModal(false)}>
          <div className="feedback-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="feedback-modal-close"
              onClick={() => setShowFeedbackModal(false)}
              title="Close"
            >
              ✕
            </button>

            <h2 className="feedback-modal-title">Pronunciation Feedback</h2>

            {feedbackData.isError ? (
              <div className="feedback-error">
                <div className="feedback-icon">❌</div>
                <p className="feedback-error-message">{feedbackData.error}</p>
              </div>
            ) : (
              <>
                <div className={`feedback-score ${feedbackData.isCorrect ? 'correct' :
                  feedbackData.isClose ? 'close' : 'incorrect'
                  }`}>
                  <div className="feedback-icon">
                    {feedbackData.isCorrect ? '✅' : feedbackData.isClose ? '⚠️' : '❌'}
                  </div>
                  <div className="feedback-percentage">{feedbackData.similarity}%</div>
                  <div className="feedback-label">
                    {feedbackData.isCorrect ? 'Excellent!' :
                      feedbackData.isClose ? 'Good try!' : 'Keep practicing!'}
                  </div>
                </div>

                <div className="feedback-details">
                  <div className="feedback-detail-item">
                    <span className="feedback-detail-label">You said:</span>
                    <span className="feedback-detail-value">"{feedbackData.spoken}"</span>
                  </div>
                  <div className="feedback-detail-item">
                    <span className="feedback-detail-label">Expected:</span>
                    <span className="feedback-detail-value">"{feedbackData.expected}"</span>
                  </div>
                </div>

                <div className="feedback-actions">
                  <button
                    className="feedback-button feedback-button-primary"
                    onClick={() => setShowFeedbackModal(false)}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Vocabulary;
