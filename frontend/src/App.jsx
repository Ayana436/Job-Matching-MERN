import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized";
import RecruiterView from "./pages/RecruiterView";
import AuthPage from "./pages/AuthPage";
import CandidateView from "./pages/CandidateView";
import ApplicantsList from "./components/ApplicantsList";
import MyApplications from "./components/MyApplications";
import "./App.css";

function App() {
    return (
        <div className="App">
            <Routes>
                {/* PUBLIC */}
                <Route path="/" element={<Navigate to="/auth" />} />
                <Route path="/auth" element={<AuthPage />} />

                {/* CANDIDATE */}
                <Route
                    path="/candidate"
                    element={
                        <ProtectedRoute allowedRole="candidate">
                            <CandidateView />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/my-applications"
                    element={
                        <ProtectedRoute allowedRole="candidate">
                            <MyApplications />
                        </ProtectedRoute>
                    }
                />

                {/* RECRUITER */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRole="recruiter">
                            <RecruiterView />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/applicants"
                    element={
                        <ProtectedRoute allowedRole="recruiter">
                            <ApplicantsList />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/unauthorized"
                    element={<Unauthorized/>
                    } 
                />

            </Routes>
        </div>
    );
}

export default App;
