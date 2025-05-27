import React, { useState } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import clientService from '../../services/clientService';
import jobService from '../../services/jobService';
import useFullProfile from '../../hooks/useFullProfile';
import ProfileCard from './ProfileCard';
import { EntityList } from './EntityList';
import { Button } from '../ui/Button';

export default function ClientPortal() {
  const { data: fullCompany, loading, error } = useFullProfile({
    loadOverview: clientService.getDashboard,
    loadDetails: clientService.getCompany,
  });

  const [posting, setPosting] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobCreated, setJobCreated] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  if (loading) return <div>Loading client portal…</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

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

  const handlePostJob = async () => {
    setPosting(true);
    setErrorMessage(null);
    setJobCreated(null);

    try {
      if (!jobTitle) {
        setErrorMessage('Job title is required');
        setPosting(false);
        return;
      }
      const jobData = {
        company_id: id,
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
      <h1 className="text-xl font-semibold mb-4">Client Dashboard</h1>

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
