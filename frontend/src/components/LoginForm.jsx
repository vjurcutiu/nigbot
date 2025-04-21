import { useState } from 'react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';


export default function LoginForm({ onLogin }) {
  const [user, setUser] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', user);
      onLogin(res.data.role);
    // redirect based on role:
    if (res.data.role === 'client') {
      navigate('/client');
    } else {
      navigate('/candidate');
    }
    } catch (err) {
      setError(err.response.data.error);
    }
  };

  return (
    <form onSubmit={submit}>
      <input
        type="text" placeholder="Username"
        value={user.username} onChange={e => setUser({...user, username: e.target.value})}
      />
      <input
        type="password" placeholder="Password"
        value={user.password} onChange={e => setUser({...user, password: e.target.value})}
      />
      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
        Login
      </button>

      {error && <div className="text-red-600 mt-2">{error}</div>}

      <p className="mt-4 text-sm">
        Don't have an account?{' '}
        <Link to="/signup" className="text-blue-600 hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
