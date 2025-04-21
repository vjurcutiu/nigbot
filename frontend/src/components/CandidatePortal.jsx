
// frontend/src/components/CandidatePortal.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { Link, Routes, Route } from 'react-router-dom';
import Marketplace from './marketplace/Marketplace';



export default function CandidatePortal() {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCandidate() {
      try {
        const [profRes, appRes] = await Promise.all([
          api.get('/candidate/profile'),
          api.get('/candidate/applications'), // assume endpoint
        ]);
        setProfile(profRes.data.profile);
        setApplications(appRes.data.applications || []);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCandidate();
  }, []);

  if (loading) return <div>Loading candidate portal...</div>;
  if (error)   return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Candidate Dashboard</h1>
      <section className="mb-6">
        <h2 className="text-lg font-medium">Profile</h2>
        <pre>{JSON.stringify(profile, null, 2)}</pre>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-medium">Your Applications</h2>
        {applications.length ? (
          <ul className="list-disc pl-5">
            {applications.map((app, idx) => (
              <li key={idx}>{app.position} @ {app.company}</li>
            ))}
          </ul>
        ) : (
          <div>No applications found</div>
        )}
      </section>

      <nav>
        <Link to="/candidate/apply" className="mr-4 underline">Apply</Link>
        <Link to="/candidate/settings" className="underline">Settings</Link>
        <Link to="/candidate/marketplace" className="underline">
          Marketplace
        </Link>
      </nav>

      <Routes>
        <Route path="apply" element={<div>Job application form (TODO)</div>} />
        <Route path="settings" element={<div>Settings page (TODO)</div>} />
        <Route path="marketplace" element={<Marketplace />} />
      </Routes>
    </div>
  );
}
