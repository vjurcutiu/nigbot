import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import candidateService from '../../services/candidateService';
import useFullProfile from '../../hooks/useFullProfile';
import { EntityList } from './EntityList';
import ProfileCard from './ProfileCard';

export default function CandidatePortal() {
  const { data: fullData, loading, error } = useFullProfile({
    loadOverview: candidateService.getProfile,
    loadDetails: candidateService.getFull,
  });

  if (loading) return <div>Loading candidate portal...</div>;
  if (error)   return <div>Error: {error}</div>;

  const {
    profile = {},
    employments = [],
    documents = [],
    applications = [],
    skills = [],
    educations = [],
  } = fullData || {};

  // Transform profile into fields array for ProfileCard
  const profileFields = Object.entries(profile).map(([key, value]) => ({
    label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    value: typeof value === 'object' ? JSON.stringify(value) : value,
  }));

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Candidate Dashboard</h1>

      <ProfileCard title="Profile" fields={profileFields} />

      <EntityList
        title="Employments"
        items={employments}
        renderItem={({ id, company_name, position_title }) => (
          <li key={id}>{company_name} — {position_title}</li>
        )}
      />

      <EntityList
        title="Documents"
        items={documents}
        renderItem={({ id, url, name }) => (
          <li key={id}>
            <a href={url} target="_blank" rel="noopener noreferrer">{name}</a>
          </li>
        )}
      />

      <EntityList
        title="Applications"
        items={applications}
        renderItem={({ id, position, company, date_applied }) => (
          <li key={id}>
            {position} @ {company} (applied on {new Date(date_applied).toLocaleDateString()})
          </li>
        )}
      />

      <EntityList
        title="Skills"
        items={skills}
        renderItem={({ id, name }) => <li key={id}>{name}</li>}
      />

      <EntityList
        title="Educations"
        items={educations}
        renderItem={({ id, institution, degree, start_year, end_year }) => (
          <li key={id}>
            {institution} — {degree} ({start_year}–{end_year || 'present'})
          </li>
        )}
      />

      <nav className="mt-4">
        <Link to="apply" className="mr-4 underline">Apply</Link>
        <Link to="settings" className="mr-4 underline">Settings</Link>
        <Link to="/marketplace" className="mr-4 underline">Marketplace</Link>
        <Link to="/chat" className="underline">Chat</Link>
      </nav>

      <Routes>
        <Route path="apply" element={<div>Job application form (TODO)</div>} />
        <Route path="settings" element={<div>Settings page (TODO)</div>} />
      </Routes>
    </div>
  );
}
