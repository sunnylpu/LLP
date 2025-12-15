import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  // OTP verification - no token returned, user needs to verify first
  return response.data;
};

export const login = async (userData) => {
  const response = await api.post('/auth/login', userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const loginWithGoogle = async (tokenId, userInfo = null) => {
  const response = await api.post('/auth/google', { tokenId, userInfo });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

// OTP Verification API
export const verifyOTP = async (email, otp) => {
  const response = await api.post('/auth/verify-otp', { email, otp });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const resendOTP = async (email) => {
  const response = await api.post('/auth/resend-otp', { email });
  return response.data;
};

// Courses API
export const getCourses = async () => {
  const response = await api.get('/courses');
  return response.data;
};

export const getCourse = async (id) => {
  const response = await api.get(`/courses/${id}`);
  return response.data;
};

// Lessons API
export const getLessons = async (courseId) => {
  const response = await api.get(`/lessons?courseId=${courseId}`);
  return response.data;
};

export const getLesson = async (id) => {
  const response = await api.get(`/lessons/${id}`);
  return response.data;
};

// Listening Lessons API
export const getListeningLessons = async () => {
  const response = await api.get('/listening');
  return response.data;
};

export const getListeningLesson = async (id) => {
  const response = await api.get(`/listening/${id}`);
  return response.data;
};

export const textToSpeech = async (text, languageCode = 'en-US') => {
  const response = await api.post('/tts', { text, languageCode });
  return response.data; // expected to contain base64 mp3
};

// Vocabulary API
export const getVocabulary = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await api.get(`/vocabulary?${params}`);
  return response.data;
};

export const getVocabularyWord = async (id) => {
  const response = await api.get(`/vocabulary/${id}`);
  return response.data;
};

export const createVocabulary = async (vocabularyData) => {
  const response = await api.post('/vocabulary', vocabularyData);
  return response.data;
};

export const createVocabularyBulk = async (words, language = 'French') => {
  const response = await api.post('/vocabulary/bulk', { words, language });
  return response.data;
};

export const parseSentence = async (sentence, language = 'French') => {
  const response = await api.post('/vocabulary/parse-sentence', { sentence, language });
  return response.data;
};

export const translateWord = async (word, sourceLang, targetLang) => {
  const response = await api.post('/translate', { word, sourceLang, targetLang });
  return response.data.translatedText;
};

export const updateVocabulary = async (id, updates) => {
  const response = await api.put(`/vocabulary/${id}`, updates);
  return response.data;
};

export const deleteVocabulary = async (id) => {
  const response = await api.delete(`/vocabulary/${id}`);
  return response.data;
};

export const deleteVocabularyBulk = async (ids) => {
  const response = await api.delete('/vocabulary', { data: { ids } });
  return response.data;
};

export const searchVocabulary = async (query, language) => {
  const params = new URLSearchParams({ q: query });
  if (language) params.append('language', language);
  const response = await api.get(`/vocabulary/search?${params}`);
  return response.data;
};

export const getVocabularyStats = async (language, userId) => {
  const params = new URLSearchParams();
  if (language) params.append('language', language);
  if (userId) params.append('userId', userId);
  const response = await api.get(`/vocabulary/stats/summary?${params}`);
  return response.data;
};

// Contact API
export const submitContactForm = async (contactData) => {
  const response = await api.post('/contact', contactData);
  return response.data;
};

export default api;

