import React, { useContext } from 'react';
import { Link, Routes, Route, useParams } from 'react-router-dom';
import candidateService from '../../services/candidateService';
import useFullProfile from '../../hooks/useFullProfile';
import { EntityList } from './EntityList';
import ProfileCard from './ProfileCard';
import { UserContext } from '../../contexts/UserContext';

export default function CandidatePortal({ editable = true }) {
  const { userId: paramUserId, candidateId: paramCandidateId } = useParams();
  const { user } = useContext(UserContext);

  const profileId = paramUserId || paramCandidateId;

  if (!profileId) {
    return <div>Loading profile...</div>;
  }

  const { data: fullData, loading, error } = useFullProfile({
    loadOverview: () => {
      if (editable) {
        return candidateService.getProfile(profileId);
      } else {
        return Promise.resolve({ id: profileId });
      }
    },
    loadDetails: () => {
      if (editable) {
        return candidateService.getFull(profileId);
      } else {
        return candidateService.getFullPublic(profileId);
      }
    },
  });

  if (loading) return <div>Loading candidate portal...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  const {
    profile = {},
    employments = [],
    documents = [],
    applications = [],
    skills = [],
    educations = [],
  } = fullData || {};

  const isOwner = user?.userId && profile?.user_id && user.userId === profile.user_id;

  // Transform profile into fields array for ProfileCard
  const profileFields = Object.entries(profile).map(([key, value]) => ({
    label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    value: typeof value === 'object' ? JSON.stringify(value) : value,
  }));

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Candidate Dashboard</h1>

      <ProfileCard title="Profile" fields={profileFields} editable={isOwner && editable} />

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
        {isOwner && editable && <Link to="settings" className="mr-4 underline">Settings</Link>}
        <Link to="/marketplace" className="mr-4 underline">Marketplace</Link>
        <Link to="/chat" className="underline">Chat</Link>
      </nav>

      <Routes>
        <Route path="apply" element={<div>Job application form (TODO)</div>} />
        {isOwner && editable && <Route path="settings" element={<div>Settings page (TODO)</div>} />}
      </Routes>
    </div>
  );
}
