// handles both login & signup in one card
import React, { useState } from 'react';
import axios from 'axios';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState('candidate');
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Pointing to your backend auth routes
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        const payload = isLogin 
            ? { email: formData.email, password: formData.password } 
            : { ...formData, role };

        try {
            const res = await axios.post(endpoint, payload);
            if (isLogin) {
                localStorage.setItem('token', res.data.token);
                const { token, user } = res.data;
                const userToSave = {
                    id: user.id || user._id,
                    name: user.name,
                    role: user.role
                };
                // Save the "Key" (Token) and User info
                localStorage.setItem('user', JSON.stringify(userToSave));
                console.log("Saved to storage:", userToSave);
                // Redirect based on the role in your database
                window.location.href = user.role === 'recruiter' ? '/admin' : '/';
            } else {
                alert("Registration Successful! Please log in.");
                setIsLogin(true);
            }
        } catch (err) {
            console.error("Auth Error:", err.response?.data);
            // alerting the user instead of letting the app crash
            alert(err.response?.data?.error || "Auth Error: Check if backend is running");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                <p style={{ color: '#aaa', marginBottom: '25px' }}>
                    {isLogin ? 'Login to manage your applications' : 'Join the Qollabb matching platform'}
                </p>

                {/* Dynamic Role Toggle */}
                <div className="role-toggle-container">
                    <div 
                        className="role-slider" 
                        style={{ left: role === 'candidate' ? '4px' : '50%' }}
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

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="auth-input-group">
                            <input 
                                className="auth-input"
                                type="text" 
                                placeholder="Full Name" 
                                required 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                    )}
                    <div className="auth-input-group">
                        <input 
                            className="auth-input"
                            type="email" 
                            placeholder="Email Address" 
                            required 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <div className="auth-input-group">
                        <input 
                            className="auth-input"
                            type="password" 
                            placeholder="Password" 
                            required 
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>
                    <button className="auth-submit-btn" type="submit">
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <p style={{ marginTop: '20px', fontSize: '0.9rem', color: '#888' }}>
                    {isLogin ? "New here?" : "Already have an account?"}
                    <span 
                        className="auth-link"
                        style={{ color: '#646cff', cursor: 'pointer', marginLeft: '8px', fontWeight: '600' }}
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? 'Create one now' : 'Log in here'}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default AuthPage;