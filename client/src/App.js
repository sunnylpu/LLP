import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import VocabularyPage from './pages/VocabularyPage';
import ListeningPractice from './pages/ListeningPractice';
import LessonView from './components/listening/LessonView';
import LanguageSelector from './components/LanguageSelector';
import Contact from './pages/Contact';
import About from './pages/About';
import CoursesPage from './pages/CoursesPage';
import VerifyOTPPage from './pages/VerifyOTPPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/vocabulary" element={<VocabularyPage />} />
        <Route path="/listening" element={<LanguageSelector />} />
        <Route path="/listening-practice" element={<ListeningPractice />} />
        <Route path="/listening-practice/:id" element={<LessonView />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/courses" element={<CoursesPage />} />
      </Routes>
    </Router>
  );
}

export default App;

