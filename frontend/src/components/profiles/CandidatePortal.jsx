import React, { useState, useContext, useCallback } from 'react';
import { Link, Routes, Route, useParams } from 'react-router-dom';
import candidateService from '../../services/candidateService';
import useFullProfile from '../../hooks/useFullProfile';
import { EntityList } from './EntityList';
import EditableProfileCard from './EditableProfileCard';
import { Button } from '../ui/Button';
import { UserContext } from '../../contexts/UserContext';
import api from '../../services/api';
import './CandidatePortal.css';

export default function CandidatePortal({ editable = true }) {
  const { userId: paramUserId, candidateId: paramCandidateId } = useParams();
  const { user } = useContext(UserContext);
  const [isHiring, setIsHiring] = useState(false);
  const [hireError, setHireError] = useState(null);
  const [hireSuccess, setHireSuccess] = useState(null);

  const profileId = paramUserId || paramCandidateId;

  if (!profileId) {
    return <div>Loading profile...</div>;
  }

  const loadOverview = useCallback(() => {
    if (editable) {
      return candidateService.getProfile(profileId);
    } else {
      return Promise.resolve({ id: profileId });
    }
  }, [editable, profileId]);
  const loadDetails = useCallback(() => {
    if (editable) {
      return candidateService.getFull(profileId);
    } else {
      return candidateService.getFullPublic(profileId);
    }
  }, [editable, profileId]);

  const { data: fullData, loading, error } = useFullProfile({
    loadOverview,
    loadDetails,
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

  const isOwner = user?.candidateId && profileId && user.candidateId.toString() === profileId.toString();

  // Transform profile into fields array for EditableProfileCard
  const profileFields = Object.entries(profile).map(([key, value]) => ({
    name: key,
    label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    value: typeof value === 'object' ? JSON.stringify(value) : value,
  }));

  const handleSave = async (diff) => {
    try {
      await candidateService.updateFull(profileId, diff);
    } catch (error) {
      console.error('Failed to save candidate profile:', error);
      throw error;
    }
  };

  const handleHire = async () => {
    setIsHiring(true);
    setHireError(null);
    setHireSuccess(null);
    try {
      const response = await api.post(`/hire/${profileId}`, {});
      setHireSuccess('Candidate hired successfully! Conversation started.');
    } catch (err) {
      setHireError(err.response?.data?.error || err.message || 'Failed to hire candidate');
    } finally {
      setIsHiring(false);
    }
  };

  return (
    <div className="candidate-portal-container">
      <h1>Candidate Dashboard</h1>

      {user?.role === 'client' && (
        <div>
          <Button onClick={handleHire} disabled={isHiring} className="candidate-portal-button">
            {isHiring ? 'Hiring...' : 'Hire Candidate'}
          </Button>
          {hireError && <p className="candidate-portal-message error">{hireError}</p>}
          {hireSuccess && <p className="candidate-portal-message success">{hireSuccess}</p>}
        </div>
      )}

      <EditableProfileCard
        title="Profile"
        fields={profileFields}
        initialData={profile}
        onSave={handleSave}
        editable={isOwner && editable}
      />

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
            <Link to={`/applications/${id}`} className="candidate-portal-nav-link">
              {position} @ {company} (applied on {new Date(date_applied).toLocaleDateString()})
            </Link>
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

      <nav className="candidate-portal-nav">
        <Link to="apply" className="candidate-portal-nav-link">Apply</Link>
        {isOwner && editable && <Link to="settings" className="candidate-portal-nav-link">Settings</Link>}
        <Link to="/marketplace" className="candidate-portal-nav-link">Marketplace</Link>
        <Link to="/chat" className="candidate-portal-nav-link">Chat</Link>
      </nav>

      <Routes>
        <Route path="apply" element={<div>Job application form (TODO)</div>} />
        {isOwner && editable && <Route path="settings" element={<div>Settings page (TODO)</div>} />}
      </Routes>
    </div>
  );
}
