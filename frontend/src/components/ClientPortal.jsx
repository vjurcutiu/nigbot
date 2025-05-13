import { useState, useEffect } from 'react';
import clientService from '../services/clientService';
import { Link, Routes, Route } from 'react-router-dom';
import Marketplace from './marketplace/Marketplace';

export default function ClientPortal() {
  const [fullCompany, setFullCompany] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    async function fetchClientData() {
      try {
        // First, get dashboard to obtain companyId
        const overview = await clientService.getDashboard();
        // Then, fetch full company info using that ID
        const company  = await clientService.getCompany(overview.companyId);
        setFullCompany(company);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchClientData();
  }, []);

  if (loading) return <div>Loading client portal…</div>;
  if (error)   return <div className="text-red-600">Error: {error}</div>;

  const {
    id,
    name,
    bio,
    website,
    industry,
    size,
    founded_date,
    address,
    city,
    country,
    contact_email,
    contact_phone,
    job_positions = []
  } = fullCompany || {};

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Client Dashboard</h1>

      {fullCompany ? (
        <>
          <section className="mb-6">
            <h2 className="text-lg font-medium">Company Profile</h2>
            <ul className="list-none space-y-1">
              <li><strong>ID:</strong> {id}</li>
              <li><strong>Name:</strong> {name}</li>
              <li><strong>Industry:</strong> {industry}</li>
              <li><strong>Size:</strong> {size}</li>
              <li><strong>Founded:</strong> {founded_date}</li>
              <li><strong>Website:</strong> <a href={website} target="_blank" rel="noopener noreferrer">{website}</a></li>
              <li><strong>Contact:</strong> {contact_email} | {contact_phone}</li>
              <li><strong>Location:</strong> {address}, {city}, {country}</li>
              <li><strong>Bio:</strong> {bio}</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-medium">Job Positions</h2>
            {job_positions.length ? (
              <ul className="list-disc pl-5">
                {job_positions.map((pos) => (
                  <li key={pos.id}>
                    <strong>{pos.title}</strong> — {pos.department} @ {pos.location} 
                    (posted {new Date(pos.posted_at).toLocaleDateString()})
                  </li>
                ))}
              </ul>
            ) : (
              <div>No active job positions.</div>
            )}
          </section>
        </>
      ) : (
        <div>No company data available.</div>
      )}

      <nav className="mt-6">
        <Link to="settings" className="mr-4 underline">Settings</Link>
        <Link to="reports"  className="mr-4 underline">Reports</Link>
        <Link to="marketplace" className="underline">Marketplace</Link>
      </nav>

      <Routes>
        <Route path="settings" element={<div>Settings page (TODO)</div>} />
        <Route path="reports"  element={<div>Reports page (TODO)</div>} />
        <Route path="marketplace" element={<Marketplace />} />
      </Routes>
    </div>
  );
}
