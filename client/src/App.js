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

import Speaking from './components/SpeakingPractice';
import GlobalProvider from './levels/globalfile';
import Level1 from './levels/level1';


import CourseDetailPage from './pages/CourseDetailPage';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/vocabulary" element={<VocabularyPage />} />



        <Route path="/dashboard/speaking" element={<Speaking/>}></Route>
        <Route path="/audio" element={<GlobalProvider/>}></Route>


        <Route path="/dashboard/speaking/level/:id" element={<Level1></Level1>}></Route>


        <Route path="/listening" element={<LanguageSelector />} />
        <Route path="/listening-practice" element={<ListeningPractice />} />
        <Route path="/listening-practice/:id" element={<LessonView />} />



        <Route path="/contact" element={<Contact />} />

         contactUs

        <Route path="/about" element={<About />} />


        <Route path="/course/:id" element={<CourseDetailPage />} />

      </Routes>
    </Router>
  );
}

export default App;

