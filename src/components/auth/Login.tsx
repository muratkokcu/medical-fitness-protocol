import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Giriş Yap</h1>
          <p>Medikal Fitness Dashboard'a hoş geldiniz</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Kullanıcı Adı</label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Kullanıcı adınızı girin"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Şifrenizi girin"
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;