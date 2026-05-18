// handles both login & signup in one card
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import API from '../api';

const AuthPage = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState('candidate');
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isLogin
        ? "/api/auth/login"
        : "/api/auth/register";

    const payload = isLogin
        ? {
                email: formData.email,
                password: formData.password,
            }
            : {
                ...formData,
                role,
            };

    try {
        const res = await API.post(endpoint, payload);

        if (isLogin) {
            const token = res.data.token;
            const loggedInUser = res.data.user;

            localStorage.setItem("token", token);

            const userToSave = {
                id: loggedInUser.id || loggedInUser._id,
                name: loggedInUser.name,
                role: loggedInUser.role,
            };

            localStorage.setItem(
                "user",
                JSON.stringify(userToSave)
            );

            navigate(
                loggedInUser.role === "recruiter"
                    ? "/admin"
                    : "/candidate"
            );
        } else {
            alert("Registration Successful! Please log in.");
            setIsLogin(true);
        }
    } catch (err) {
        console.error(err);

        alert(
            err.response?.data?.error ||
            "Auth Error: Check backend connection"
        );
    }
};

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                <p style={{ color: '#aaa', marginBottom: '25px', fontSize: '0.9rem' }}>
                    {isLogin ? 'Login to manage your applications' : 'Join the Qollabb matching platform'}
                </p>

                <div className="role-toggle-container">
                    <div 
                        className="role-slider" 
                        style={{ left: role === 'candidate' ? '4px' : 'calc(50% - 2px)' }}
                    ></div>
                    <button 
                        type="button"
                        className={`role-option ${role === 'candidate' ? 'active' : ''}`}
                        onClick={() => setRole('candidate')}
                    >
                        Candidate
                    </button>
                    <button 
                        type="button"
                        className={`role-option ${role === 'recruiter' ? 'active' : ''}`}
                        onClick={() => setRole('recruiter')}
                    >
                        Recruiter
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="auth-form-wrapper">
                    {!isLogin && (
                        <div className="auth-input-group">
                            <label className="input-label">Full Name</label>
                            <input 
                                className="auth-input"
                                type="text" 
                                placeholder="Enter your name" 
                                required 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                    )}
                    
                    <div className="auth-input-group">
                        <label className="input-label">Email Address</label>
                        <input 
                            className="auth-input"
                            type="email" 
                            placeholder="name@company.com" 
                            required 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>

                    <div className="auth-input-group" style={{ marginBottom: isLogin ? '5px' : '20px' }}>
                        <label className="input-label">Password</label>
                        <input 
                            className="auth-input"
                            type="password" 
                            placeholder="••••••••" 
                            required 
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>

                    {isLogin && (
                        <div className="forgot-password-container">
                            <button 
                                type="button" 
                                className="forgot-link"
                                onClick={() => alert("Reset link sent to " + formData.email)}
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )}

                    <button className="auth-submit-btn" type="submit">
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <p className="auth-footer-text">
                    {isLogin ? "New here?" : "Already have an account?"}
                    <span 
                        className="auth-link-toggle"
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? ' Create one now' : ' Log in here'}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
