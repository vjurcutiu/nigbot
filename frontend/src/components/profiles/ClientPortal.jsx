import React, { useState, useContext, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import clientService from '../../services/clientService';
import jobService from '../../services/jobService';
import useFullProfile from '../../hooks/useFullProfile';
import EditableProfileCard from './EditableProfileCard';
import { EntityList } from './EntityList';
import { Button } from '../ui/Button';
import { UserContext } from '../../contexts/UserContext';
import api from '../../services/api';
import './ClientPortal.css';

export default function ClientPortal({ editable = true }) {
  const { userId: paramUserId, companyId: paramCompanyId } = useParams();

  const { user } = useContext(UserContext);

  const profileId = paramUserId || paramCompanyId;

  if (!profileId) {
    return <div>Loading profile...</div>;
  }

  if (user.loading) {
    return <div>Loading user data...</div>;
  }

  const loadOverview = useCallback(() => {
    if (editable) {
      return clientService.getDashboard();
    } else {
      return Promise.resolve({ id: profileId });
    }
  }, [editable, profileId]);
  const loadDetails = useCallback((id) => {
    if (editable) {
      return clientService.getCompany(id);
    } else {
      return clientService.getCompanyPublic(id);
    }
  }, [editable]);

  const { data: fullCompany, loading, error } = useFullProfile({
    loadOverview,
    loadDetails,
  });

  const isOwner = user?.userId && fullCompany?.user_id && user.userId === fullCompany.user_id;

  // Prevent editable from being true until user loading is false and ownership is confirmed
  const effectiveEditable = !user.loading && isOwner && editable;

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
    { name: 'id', label: 'ID' },
    { name: 'name', label: 'Name' },
    { name: 'industry', label: 'Industry' },
    { name: 'size', label: 'Size' },
    { name: 'founded_date', label: 'Founded', type: 'date' },
    { name: 'website', label: 'Website' },
    { name: 'contact_email', label: 'Contact Email' },
    { name: 'contact_phone', label: 'Contact Phone' },
    { name: 'address', label: 'Address' },
    { name: 'city', label: 'City' },
    { name: 'country', label: 'Country' },
    { name: 'bio', label: 'Bio' }
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
    <div className="client-portal-container">
      <h1>Client Dashboard</h1>

      {effectiveEditable && (
        <Button
          variant="default"
          onClick={() => {
            // Navigate to the new JobPostPortal component route
            window.location.href = '/jobs/post';
          }}
          disabled={posting}
          className="client-portal-button mb-4"
        >
          Post Job
        </Button>
      )}

      {jobTitle && effectiveEditable && (
        <div className="client-portal-message mb-4">
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

      {errorMessage && effectiveEditable && <div className="client-portal-message error mb-4">{errorMessage}</div>}
      {jobCreated && effectiveEditable && (
        <div className="client-portal-message success mb-4">
          Job posted successfully: {jobCreated.title} (ID: {jobCreated.id})
        </div>
      )}

      <EditableProfileCard
        key={profileId + '-' + (isOwner ? 'owner' : 'notowner')}
        title="Company Profile"
        fields={profileFields}
        initialData={fullCompany}
        onSave={(diff) => clientService.updateCompany(fullCompany.id, diff)}
        editable={effectiveEditable}
      />

      <EntityList
        title="Job Positions"
        items={job_positions}
        renderItem={({ id, title, department, location, posted_at }) => (
          <li key={id}>
            <strong>
              <Link to={`/job/${id}`} className="client-portal-nav-link">
                {title}
              </Link>
            </strong> — {department} @ {location} (posted on {new Date(posted_at).toLocaleDateString()})
          </li>
        )}
      />

      <nav className="client-portal-nav">
        <Link to="/marketplace" className="client-portal-nav-link mr-4">Marketplace</Link>
        <Link to="/chat" className="client-portal-nav-link">Chat</Link>
      </nav>
    </div>
  );
}
