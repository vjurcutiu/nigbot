import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import jobService from '../../services/jobService';
import clientService from '../../services/clientService';
import useFullProfile from '../../hooks/useFullProfile';
import EditableProfileCard from './EditableProfileCard';
import { EntityList } from './EntityList';
import { Button } from '../ui/Button';

export default function JobPortal() {
  const { data: fullCompany, loading, error } = useFullProfile({
    loadOverview: clientService.getDashboard,
    loadDetails: clientService.getCompany,
  });

  const [jobData, setJobData] = useState(null);
  const [posting, setPosting] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobCreated, setJobCreated] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  React.useEffect(() => {
    if (fullCompany && fullCompany.job_positions && fullCompany.job_positions.length > 0) {
      const firstJobId = fullCompany.job_positions[0].id;
      jobService.getJob(firstJobId).then(setJobData).catch(console.error);
    } else {
      setJobData(null);
    }
  }, [fullCompany]);

  const profileFields = [
    { name: 'title', label: 'Job Title' },
    { name: 'description', label: 'Description' },
    { name: 'requirements', label: 'Requirements' },
    { name: 'location', label: 'Location' },
    { name: 'employment_type', label: 'Employment Type' },
    { name: 'remote', label: 'Remote', type: 'boolean' }
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
      const jobDataToCreate = {
        company_id: fullCompany.id,
        title: jobTitle,
      };
      const createdJob = await jobService.createJob(jobDataToCreate);
      setJobCreated(createdJob);
      setJobTitle('');
    } catch (err) {
      setErrorMessage(err.response?.data?.description || 'Failed to create job');
    } finally {
      setPosting(false);
    }
  };

  if (loading) return <div>Loading job portal…</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Job Dashboard</h1>

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

      {jobData && (
        <>
          <EditableProfileCard
            title="Job Profile"
            fields={profileFields}
            initialData={jobData}
            onSave={(diff) => {
              jobService.updateJob(jobData.id, diff).then(setJobData).catch(console.error);
            }}
          />

          <EntityList
            title="Applications"
            items={jobData.applications || []}
            renderItem={({ id, candidate_name, status, applied_at }) => (
              <li key={id}>
                <strong>{candidate_name}</strong> — {status} (applied on {new Date(applied_at).toLocaleDateString()})
              </li>
            )}
          />
        </>
      )}

      <nav className="mt-6">
        <Link to="/marketplace" className="mr-4 underline">Marketplace</Link>
        <Link to="/chat" className="underline">Chat</Link>
      </nav>
    </div>
  );
}
