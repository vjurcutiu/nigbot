import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import React, { useState } from 'react';
import candidateService from '../../services/candidateService';
import jobService from '../../services/jobService';
import useFullProfile from '../../hooks/useFullProfile';
import { EntityList } from './EntityList';
import ProfileCard from './ProfileCard';
import { Button } from '../ui/Button';

export default function CandidatePortal() {
  const { data: fullData, loading, error } = useFullProfile({
    loadOverview: candidateService.getProfile,
    loadDetails: candidateService.getFull,
  });

  const [posting, setPosting] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobCreated, setJobCreated] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  if (loading) return <div>Loading candidate portal...</div>;
  if (error) return <div>Error: {error}</div>;

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

  const handlePostJob = async () => {
    setPosting(true);
    setErrorMessage(null);
    setJobCreated(null);

    try {
      // For demo, use company_id from profile if available, else 1 as fallback
      const companyId = profile.company_id || 1;
      if (!jobTitle) {
        setErrorMessage('Job title is required');
        setPosting(false);
        return;
      }
      const jobData = {
        company_id: companyId,
        title: jobTitle,
      };
      const createdJob = await jobService.createJob(jobData);
      setJobCreated(createdJob);
      setJobTitle('');
    } catch (err) {
      setErrorMessage(err.response?.data?.description || 'Failed to create job');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Candidate Dashboard</h1>

      <Button
        variant="default"
        onClick={() => {
          const title = prompt('Enter job title:');
          if (title) setJobTitle(title);
        }}
        disabled={posting}
        className="mb-4"
      >
        Post Job
      </Button>

      {jobTitle && (
        <div className="mb-4">
          <p>Posting job: <strong>{jobTitle}</strong></p>
          <Button variant="default" onClick={handlePostJob} disabled={posting}>
            {posting ? 'Posting...' : 'Confirm Post'}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setJobTitle('');
              setErrorMessage(null);
              setJobCreated(null);
            }}
            disabled={posting}
            className="ml-2"
          >
            Cancel
          </Button>
        </div>
      )}

      {errorMessage && <div className="text-red-600 mb-4">{errorMessage}</div>}
      {jobCreated && (
        <div className="text-green-600 mb-4">
          Job posted successfully: {jobCreated.title} (ID: {jobCreated.id})
        </div>
      )}

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
