import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import clientService from '../../services/clientService';
import useFullProfile from '../../hooks/useFullProfile';
import ProfileCard from './ProfileCard';
import { EntityList } from './EntityList';

export default function ClientPortal() {
  const { data: fullCompany, loading, error } = useFullProfile({
    loadOverview: clientService.getDashboard,
    loadDetails: clientService.getCompany,
  });

  if (loading) return <div>Loading client portal…</div>;
  if (error)   return <div className="text-red-600">Error: {error}</div>;

  const {
    id,
    name,
    industry,
    size,
    founded_date,
    website,
    contact_email,
    contact_phone,
    address,
    city,
    country,
    bio,
    job_positions = []
  } = fullCompany || {};

  const profileFields = [
    { label: 'ID', value: id },
    { label: 'Name', value: name },
    { label: 'Industry', value: industry },
    { label: 'Size', value: size },
    { label: 'Founded', value: founded_date },
    { label: 'Website', value: <a href={website} target="_blank" rel="noopener noreferrer">{website}</a> },
    { label: 'Contact', value: `${contact_email} | ${contact_phone}` },
    { label: 'Location', value: `${address}, ${city}, ${country}` },
    { label: 'Bio', value: bio }
  ];

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Client Dashboard</h1>

      <ProfileCard title="Company Profile" fields={profileFields} />

      <EntityList
        title="Job Positions"
        items={job_positions}
        renderItem={({ id, title, department, location, posted_at }) => (
          <li key={id}>
            <strong>{title}</strong> — {department} @ {location} (posted on {new Date(posted_at).toLocaleDateString()})
          </li>
        )}
      />

      <nav className="mt-6">
        <Link to="settings" className="mr-4 underline">Settings</Link>
        <Link to="reports" className="mr-4 underline">Reports</Link>
        <Link to="/marketplace" className="mr-4 underline">Marketplace</Link>
        <Link to="/chat" className="underline">Chat</Link>
      </nav>

      <Routes>
        <Route path="settings" element={<div>Settings page (TODO)</div>} />
        <Route path="reports" element={<div>Reports page (TODO)</div>} />
      </Routes>
    </div>
  );
}
