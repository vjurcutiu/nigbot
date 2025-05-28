import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import jobService from '../../services/jobService';
import clientService from '../../services/clientService';
import EditableProfileCard from './EditableProfileCard';
import { EntityList } from './EntityList';
import { Button } from '../ui/Button';
import { UserContext } from '../../contexts/UserContext';

export default function JobPortal() {
  const { user } = useContext(UserContext);
  const [jobData, setJobData] = useState(null);
  const [posting, setPosting] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobCreated, setJobCreated] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [fullCompany, setFullCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  // TODO: FIX FLICKERING
  useEffect(() => {
    setLoading(true);
    if (user?.role === 'client') {
      if (!user.company) {
        clientService.getDashboard()
          .then(data => setFullCompany(data.company))
          .catch(() => setFullCompany(null))
          .finally(() => setLoading(false));
      } else {
        setFullCompany(user.company);
        setLoading(false);
      }
    } else {
      setFullCompany(null);
      setLoading(false);
    }
  }, [user]);

  // New effect to load job data for logged in companies that do not own the job
  useEffect(() => {
    setLoading(true);
    if (user?.role === 'client' && !fullCompany) {
      // Fetch job data without company ownership context
      // Assuming jobId is available, here we simulate with a fixed jobId or prop
      const jobId = 1; // Replace with actual jobId from props or route params
      jobService.getJob(jobId)
        .then(setJobData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, fullCompany]);

  useEffect(() => {
    setLoading(true);
    if (fullCompany && fullCompany.job_positions && fullCompany.job_positions.length > 0) {
      const firstJobId = fullCompany.job_positions[0].id;
      jobService.getJob(firstJobId)
        .then(setJobData)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setJobData(null);
      setLoading(false);
    }
  }, [fullCompany]);

  // New effect to fetch job data for candidate based on jobId param
  useEffect(() => {
    setLoading(true);
    if (user?.role === 'candidate') {
      // Assuming jobId is passed as a prop or via route params, here we simulate fetching jobId
      // For demonstration, fetch the first job from marketplace or a fixed jobId
      const jobId = fullCompany?.job_positions?.[0]?.id || 1; // fallback jobId
      jobService.getJob(jobId)
        .then(setJobData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, fullCompany]);

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

  if (!user) {
    if (loading) {
      return <div>Loading job data...</div>;
    }
    return <div>Please log in to view jobs.</div>;
  }

  if (loading) {
    return <div>Loading job data...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Job Dashboard</h1>

      {user.role === 'candidate' && jobData && (
        <>
          <EditableProfileCard
            title="Job Profile"
            fields={profileFields}
            initialData={jobData}
            editable={false}
          />
          <Button
            onClick={() => {
              // Redirect to application portal for this job
              window.location.href = `/jobs/${jobData.id}/apply`;
            }}
            className="mb-4"
          >
            Apply
          </Button>
        </>
      )}

      {user.role === 'client' && fullCompany && (
        <>
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
                editable={jobData.company_id === fullCompany.id}
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
        </>
      )}

      <nav className="mt-6">
        <Link to="/marketplace" className="mr-4 underline">Marketplace</Link>
        <Link to="/chat" className="underline">Chat</Link>
      </nav>
    </div>
  );
}
