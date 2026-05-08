import { Routes, Route, Link } from 'react-router-dom';
import CandidateView from './pages/CandidateView';
import RecruiterView from './pages/RecruiterView';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-logo">Qollabb Matcher Pro</div>
        <div className="nav-links">
          <Link to="/" className="nav-link">Find Matches</Link>
          <Link to="/admin" className="nav-link admin-btn">Post a Job</Link>
        </div>
      </nav>

      <main className="container">
        <Routes>
          <Route path="/" element={<CandidateView />} />
          <Route path="/admin" element={<RecruiterView />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;