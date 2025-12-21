import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import VocabularyPage from './pages/VocabularyPage';

import ListeningHub from './pages/ListeningHub';

import LanguageSelector from './components/LanguageSelector';
import Contact from './pages/Contact';
import About from './pages/About';
import CoursesPage from './pages/CoursesPage';
import Speaking from './components/SpeakingPractice';
import GlobalProvider from './levels/globalfile';
import Level1 from './levels/level1';
import VerifyOTPPage from './pages/VerifyOTPPage';
import AdminPage from './pages/admin/AdminPage';




import CourseDetailPage from './pages/CourseDetailPage';
import NotFound from './pages/NotFound';


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




        <Route path="/dashboard/speaking" element={<Speaking/>}></Route>
        <Route path="/audio" element={<GlobalProvider/>}></Route>


        <Route path="/dashboard/speaking/level/:id" element={<Level1></Level1>}></Route>


        <Route path="/listening" element={<ListeningHub />} />





        <Route path="/contact" element={<Contact />} />

         contactUs

        <Route path="/about" element={<About />} />



        <Route path="/courses/:id" element={<CourseDetailPage />} />


        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;

