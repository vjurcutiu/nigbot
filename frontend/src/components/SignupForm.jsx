import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Link } from 'react-router-dom';
import './SignupForm.css';

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
    <form onSubmit={handleSubmit} className="signup-form">
      <h2>Sign Up</h2>
      
      {/* Role selector */}
      <label>
        Role
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
        >
          <option value="candidate">Candidate</option>
          <option value="client">Client</option>
        </select>
      </label>

      {/* Username & Password */}
      <label>
        Username
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Password
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />
      </label>



          {form.role === 'candidate' ? (
            <> {/* Candidate-specific inputs */}
              <label>
                Full Name
                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Phone
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              </label>
              <label>
                City
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                />
              </label>
              <label>
                Country
                <input
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                />
              </label>
              <label>
                Profile Picture URL
                <input
                  name="profile_picture"
                  value={form.profile_picture}
                  onChange={handleChange}
                />
              </label>
              <label>
                Summary
                <textarea
                  name="summary"
                  value={form.summary}
                  onChange={handleChange}
                  rows={3}
                />
              </label>
            </>
          ) : (
            <> {/* Client-specific inputs for Company model */}
              <label>
                Company Name
                <input
                  name="company_name"
                  value={form.company_name}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Bio
                <textarea
                  name="company_bio"
                  value={form.company_bio}
                  onChange={handleChange}
                  rows={3}
                />
              </label>
              <label>
                Profile Picture URL
                <input
                  name="profile_picture"
                  value={form.profile_picture}
                  onChange={handleChange}
                />
              </label>
              <label>
                Website
                <input
                  name="company_website"
                  value={form.company_website}
                  onChange={handleChange}
                />
              </label>
              <label>
                Industry
                <input
                  name="company_industry"
                  value={form.company_industry}
                  onChange={handleChange}
                />
              </label>
              <label>
                Size
                <input
                  name="company_size"
                  value={form.company_size}
                  onChange={handleChange}
                  placeholder="e.g., 1-10, 11-50"
                />
              </label>
              <label>
                Founded Date
                <input
                  type="date"
                  name="company_founded_date"
                  value={form.company_founded_date}
                  onChange={handleChange}
                />
              </label>
              <label>
                Address
                <input
                  name="company_address"
                  value={form.company_address}
                  onChange={handleChange}
                />
              </label>
              <label>
                City
                <input
                  name="company_city"
                  value={form.company_city}
                  onChange={handleChange}
                />
              </label>
              <label>
                Country
                <input
                  name="company_country"
                  value={form.company_country}
                  onChange={handleChange}
                />
              </label>
              <label>
                Contact Email
                <input
                  type="email"
                  name="company_contact_email"
                  value={form.company_contact_email}
                  onChange={handleChange}
                />
              </label>
              <label>
                Contact Phone
                <input
                  name="company_contact_phone"
                  value={form.company_contact_phone}
                  onChange={handleChange}
                />
              </label>
            </>
          )}

      <button type="submit">
        Sign Up
      </button>
      {error && <p className="error-message">{error}</p>}

      <p>
        Already have an account?{' '}
        <Link to="/login">
          Log in
        </Link>
      </p>
    </form>
  );
}
