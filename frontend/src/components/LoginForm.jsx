import { useState } from 'react';
import authService from '../services/authService';
import { Link, useNavigate } from 'react-router-dom';
import './LoginForm.css';

export default function LoginForm({ onLogin }) {
  const [user, setUser] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    try {
      const res = await authService.login(user.username, user.password);
      console.log('Login response:', res);
      if (res.role) {
        onLogin(res);
        // redirect based on role and proper entity ID:
        if (res.role === 'client') {
          const companyId = res.company_id || res.user_id;
          navigate(`/client/${companyId}`);
        } else if (res.role === 'candidate') {
          const candidateId = res.candidate_id || res.user_id;
          navigate(`/candidate/${candidateId}`);
        } else {
          navigate('/');
        }
      } else {
        setError('Login failed: no role returned');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Login failed');
      }
    }
  };

  return (
    <form onSubmit={submit} className="login-form">
      <input
        type="text" placeholder="Username"
        value={user.username} onChange={e => setUser({...user, username: e.target.value})}
      />
      <input
        type="password" placeholder="Password"
        value={user.password} onChange={e => setUser({...user, password: e.target.value})}
      />
      <button type="submit">
        Login
      </button>

      {error && <div className="error-message">{error}</div>}

      <p>
        Don't have an account?{' '}
        <Link to="/signup">
          Sign up
        </Link>
      </p>
    </form>
  );
}
