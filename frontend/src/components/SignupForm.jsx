import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Link } from 'react-router-dom';

export default function SignupForm() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    role: 'candidate',

    // Candidate fields
    full_name: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    profile_picture: '',
    summary: '',

    // Company fields
    company_name: '',
    company_bio: '',
    company_website: '',
    company_industry: '',
    company_size: '',
    company_founded_date: '',
    company_address: '',
    company_latitude: '',
    company_longitude: '',
    company_contact_email: '',
    company_contact_phone: '',
  });
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
      // send entire form; backend can pick relevant fields based on role
      await api.post('/auth/signup', form);
      navigate('/login', { state: { signedUp: true } });
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-4">
      <h2 className="text-xl mb-4">Sign Up</h2>

      {/* Username & Password */}
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
      <label className="block mb-4">
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

      {/* Role selector */}
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

          {form.role === 'candidate' ? (
            <> {/* Candidate-specific inputs */}
              <label className="block mb-2">
                Full Name
                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                  className="block w-full border p-1"
                />
              </label>
              <label className="block mb-2">
                Email
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="block w-full border p-1"
                />
              </label>
              <label className="block mb-2">
                Phone
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="block w-full border p-1"
                />
              </label>
              <label className="block mb-2">
                City
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="block w-full border p-1"
                />
              </label>
              <label className="block mb-2">
                Country
                <input
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className="block w-full border p-1"
                />
              </label>
              <label className="block mb-2">
                Profile Picture URL
                <input
                  name="profile_picture"
                  value={form.profile_picture}
                  onChange={handleChange}
                  className="block w-full border p-1"
                />
              </label>
              <label className="block mb-4">
                Summary
                <textarea
                  name="summary"
                  value={form.summary}
                  onChange={handleChange}
                  className="block w-full border p-1"
                  rows={3}
                />
              </label>
            </>
          ) : (
            <> {/* Client-specific inputs for Company model */}
              <label className="block mb-2">
                Company Name
                <input
                  name="company_name"
                  value={form.company_name}
                  onChange={handleChange}
                  required
                  className="block w-full border p-1"
                />
              </label>
              <label className="block mb-2">
                Bio
                <textarea
                  name="company_bio"
                  value={form.company_bio}
                  onChange={handleChange}
                  className="block w-full border p-1"
                  rows={3}
                />
              </label>
              <label className="block mb-2">
                Profile Picture URL
                <input
                  name="profile_picture"
                  value={form.profile_picture}
                  onChange={handleChange}
                  className="block w-full border p-1"
                />
              </label>
              <label className="block mb-2">
                Website
                <input
                  name="company_website"
                  value={form.company_website}
                  onChange={handleChange}
                  className="block w-full border p-1"
                />
              </label>
              <label className="block mb-2">
                Industry
                <input
                  name="company_industry"
                  value={form.company_industry}
                  onChange={handleChange}
                  className="block w-full border p-1"
                />
              </label>
              <label className="block mb-2">
                Size
                <input
                  name="company_size"
                  value={form.company_size}
                  onChange={handleChange}
                  placeholder="e.g., 1-10, 11-50"
                  className="block w-full border p-1"
                />
              </label>
              <label className="block mb-2">
                Founded Date
                <input
                  type="date"
                  name="company_founded_date"
                  value={form.company_founded_date}
                  onChange={handleChange}
                  className="block w-full border p-1"
                />
              </label>
              <label className="block mb-2">
                Address
                <input
                  name="company_address"
                  value={form.company_address}
                  onChange={handleChange}
                  className="block w-full border p-1"
                />
              </label>
              <label className="block mb-2">
                City
                <input
                  name="company_city"
                  value={form.company_city}
                  onChange={handleChange}
                  className="block w-full border p-1"
                />
              </label>
              <label className="block mb-2">
                Country
                <input
                  name="company_country"
                  value={form.company_country}
                  onChange={handleChange}
                  className="block w-full border p-1"
                />
              </label>
              <label className="block mb-2">
                Contact Email
                <input
                  type="email"
                  name="company_contact_email"
                  value={form.company_contact_email}
                  onChange={handleChange}
                  className="block w-full border p-1"
                />
              </label>
              <label className="block mb-4">
                Contact Phone
                <input
                  name="company_contact_phone"
                  value={form.company_contact_phone}
                  onChange={handleChange}
                  className="block w-full border p-1"
                />
              </label>
            </>
          )}

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
