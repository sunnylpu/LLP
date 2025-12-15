const stopWords = new Set([
  'the','a','an','of','to','and','in','on','for','with','at','by','from','up',
  'about','into','over','after','beneath','under','above','be','is','are','was',
  'were','this','that','these','those','it','as','or','but','if','then','so',
  'than','too','very','can','will','just','not','no','yes','you','your','i',
  'we','they','he','she','them','his','her','their','our','us','me','my',
]);

export const generateSummary = (text = '') => {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
  if (sentences.length === 0) return 'No summary available.';
  return sentences.slice(0, 3).join(' ');
};

export const extractVocabulary = (text = '', maxWords = 10) => {
  const words = text
    .toLowerCase()
    .replace(/[^a-zA-ZÀ-ÿ0-9\s'-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));

  const freq = new Map();
  words.forEach(w => freq.set(w, (freq.get(w) || 0) + 1));

  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxWords)
    .map(([word]) => word);
};

export const speakText = (text, languageCode = 'en-US', onEnd) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    throw new Error('Speech synthesis is not supported in this browser.');
  }
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = languageCode;
  utter.rate = 1;
  utter.pitch = 1;
  if (onEnd) {
    utter.onend = onEnd;
  }
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
};

