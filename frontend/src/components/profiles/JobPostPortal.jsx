import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jobService from '../../services/jobService';
import clientService from '../../services/clientService';
import { UserContext } from '../../contexts/UserContext';
import { Button } from '../ui/Button';
import './JobPostPortal.css';

export default function JobPostPortal() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [fullCompany, setFullCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [remote, setRemote] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [posting, setPosting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    setLoading(true);
    if (user?.role === 'client') {
      if (!user.company) {
        clientService.getDashboard()
          .then(data => {
            if (data && data.id) {
              return clientService.getCompany(data.id);
            }
            return null;
          })
          .then(fullCompanyData => {
            setFullCompany(fullCompanyData);
          })
          .catch(() => setFullCompany(null))
          .finally(() => setLoading(false));
      } else {
        clientService.getCompany(user.company.id)
          .then(fullCompanyData => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setErrorMessage(null);

    if (!title) {
      setErrorMessage('Job title is required');
      setPosting(false);
      return;
    }

    try {
      const jobDataToCreate = {
        company_id: fullCompany.id,
        title,
        description,
        requirements,
        location,
        employment_type: employmentType,
        remote,
        expires_at: expiresAt || null,
      };
      const createdJob = await jobService.createJob(jobDataToCreate);
      navigate(`/jobs/${createdJob.id}`);
    } catch (err) {
      setErrorMessage(err.response?.data?.description || 'Failed to create job');
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== 'client') {
    return <div>You must be logged in as a client to post a job.</div>;
  }

  return (
    <div className="job-post-portal">
      <h1>Post a New Job</h1>
      <form onSubmit={handleSubmit} className="job-post-form">
        <label>
          Job Title*:
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </label>
        <label>
          Description:
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </label>
        <label>
          Requirements:
          <textarea
            value={requirements}
            onChange={e => setRequirements(e.target.value)}
          />
        </label>
        <label>
          Location:
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
        </label>
        <label>
          Employment Type:
          <input
            type="text"
            value={employmentType}
            onChange={e => setEmploymentType(e.target.value)}
          />
        </label>
        <label>
          Remote:
          <input
            type="checkbox"
            checked={remote}
            onChange={e => setRemote(e.target.checked)}
          />
        </label>
        <label>
          Expires At (ISO Date):
          <input
            type="date"
            value={expiresAt}
            onChange={e => setExpiresAt(e.target.value)}
          />
        </label>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <div className="button-group">
          <Button type="submit" disabled={posting}>
            {posting ? 'Posting...' : 'Post Job'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/client')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
