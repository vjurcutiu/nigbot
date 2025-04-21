import { useState } from 'react';
import api from '../services/api';

export default function LoginForm({ onLogin }) {
  const [user, setUser] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const submit = async e => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', user);
      onLogin(res.data.role);
      // redirect based on role
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
      <button>Login</button>
      {error && <div>{error}</div>}
    </form>
  );
}
