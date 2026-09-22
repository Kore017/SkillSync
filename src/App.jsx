import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './lib/AppContext';

// Pages
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Jobs from './pages/Jobs';
import SkillGap from './pages/SkillGap';
import Mismatch from './pages/Mismatch';
import Recommendations from './pages/Recommendations';
import TrainingPlan from './pages/TrainingPlan';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/skill-gap" element={<SkillGap />} />
          <Route path="/mismatch" element={<Mismatch />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/training-plan" element={<TrainingPlan />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
