import React, { useState, useContext, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import jobService from '../../services/jobService';
import clientService from '../../services/clientService';
import EditableProfileCard from './EditableProfileCard';
import { EntityList } from './EntityList';
import { Button } from '../ui/Button';
import { UserContext } from '../../contexts/UserContext';
import './JobPortal.css';

export default function JobPortal() {
  const { user } = useContext(UserContext);
  const { jobId } = useParams();
  const [jobData, setJobData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [posting, setPosting] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobCreated, setJobCreated] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [fullCompany, setFullCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (user?.role === 'client') {
      console.log('JobPortal: user.company:', user.company);
      if (!user.company) {
        clientService.getDashboard()
          .then(data => {
            console.log('JobPortal: getDashboard data:', data);
            if (data && data.id) {
              return clientService.getCompany(data.id);
            }
            return null;
          })
          .then(fullCompanyData => {
            console.log('JobPortal: fullCompanyData:', fullCompanyData);
            setFullCompany(fullCompanyData);
          })
          .catch(() => setFullCompany(null))
          .finally(() => setLoading(false));
      } else {
        console.log('JobPortal: fetching full company for user.company.id:', user.company.id);
        clientService.getCompany(user.company.id)
          .then(fullCompanyData => {
            console.log('JobPortal: fullCompanyData:', fullCompanyData);
            setFullCompany(fullCompanyData);
          })
          .catch(() => setFullCompany(null))
          .finally(() => setLoading(false));
      }
    } else {
      setFullCompany(null);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!jobId) {
      return;
    }
    setLoading(true);
    jobService.getJob(jobId)
      .then((job) => {
        setJobData(job);
        return jobService.getJobApplications(job.id);
      })
      .then((apps) => {
        setApplications(apps);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [jobId]);

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
    <div className="job-portal">
    
      {user.role === 'candidate' && jobData && (
        <>
          <EditableProfileCard
            title="Job Profile"
            fields={profileFields}
            initialData={jobData}
            editable={false}
          />
          {applications.some(app => app.candidate_name === user.fullName) ? (
            <div className="job-portal__feedback">{'You have already applied to this job.'}</div>
          ) : (
            <div className="job-portal__button-group">
              <Button
                onClick={() => {
                  window.location.href = `/jobs/${jobData.id}/apply`;
                }}
              >
                Apply
              </Button>
            </div>
          )}
        </>
      )}

      {user.role === 'client' && fullCompany && (
        <>          
          

          {errorMessage && <div className="job-portal__feedback job-portal__feedback--error">{errorMessage}</div>}
          {jobCreated && (
            <div className="job-portal__feedback job-portal__feedback--success">
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
                items={applications}
                renderItem={({ id, candidate_name, status, applied_at }) => (
                  <li key={id}>
                    <Link to={`/applications/${id}`} className="job-portal__nav-link">
                      <strong>{candidate_name}</strong> — {status} (applied on {new Date(applied_at).toLocaleDateString()})
                    </Link>
                  </li>
                )}
              />
            </>
          )}
        </>
      )}

      <nav className="job-portal__nav">
        <Link to="/marketplace" className="job-portal__nav-link">Marketplace</Link>
        <Link to="/chat" className="job-portal__nav-link">Chat</Link>
      </nav>
    </div>
  );
}
