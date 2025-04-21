import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Link } from 'react-router-dom';


export default function SignupForm() {
  const [form, setForm] = useState({ username: '', password: '', role: 'candidate' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/signup', form);
      // on success, maybe auto-login? For now, redirect to login
      navigate('/login', { state: { signedUp: true } });
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-4">
      <h2 className="text-xl mb-4">Sign Up</h2>
      <label className="block mb-2">
        Username
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          required
          className="block w-full border p-1"
        />
      </label>
      <label className="block mb-2">
        Password
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          className="block w-full border p-1"
        />
      </label>
      <label className="block mb-4">
        Role
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="block w-full border p-1"
        >
          <option value="candidate">Candidate</option>
          <option value="client">Client</option>
        </select>
      </label>
      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
        Sign Up
      </button>
      {error && <p className="text-red-600 mt-2">{error}</p>}

      <p className="mt-4 text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:underline">
          Log in
        </Link>
      </p>
          </form>
  );
}
