import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import RecruiterView from './pages/RecruiterView'; // Use your actual filename here
import AuthPage from './pages/AuthPage';
import CandidateView from './pages/CandidateView';
import './App.css';

function App() {
  return (
    <div className="App"> 
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<CandidateView />} />
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Protected Recruiter Route */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRole="recruiter">
              <RecruiterView />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;