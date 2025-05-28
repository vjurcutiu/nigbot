import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import api from '../../services/api';

export default function ApplicationPortal() {
  const { applicationId } = useParams();
  const { user } = useContext(UserContext);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchApplication() {
      setLoading(true);
      console.log('ApplicationPortal: user:', user);
      try {
        const response = await api.get(`/applications/${applicationId}`);
        setApplication(response.data);
        setError(null);
      } catch (err) {
        console.error('ApplicationPortal: failed to load application details', err);
        setError(err.response?.data?.error || 'Failed to load application details');
      } finally {
        setLoading(false);
      }
    }
    if (user && !user.loading) {
      fetchApplication();
    }
  }, [applicationId, user]);

  if (loading) return <div>Loading application details...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!user || user.loading) return <div>Loading user info...</div>;
  if (!application) return <div>Application not found.</div>;

  const isCandidateOwner = user.candidateId && application.candidate_id === user.candidateId;
  const isClientUser = user.role === 'client';

  if (isCandidateOwner) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Application for: {application.job_title}</h2>
        <p>Status: {application.status}</p>
        <p>Applied on: {new Date(application.applied_at).toLocaleDateString()}</p>
        <p>Cover Letter: {application.cover_letter_path || 'None'}</p>
        <p>Resume: {application.resume_path || 'None'}</p>
      </div>
    );
  } else if (isClientUser) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">
          Application from: <Link to={`/candidate/${application.candidate_id}/full/public`} className="text-blue-600 underline">{application.candidate_name}</Link>
        </h2>
        <p>Job: {application.job_title}</p>
        <p>Status: {application.status}</p>
        <p>Applied on: {new Date(application.applied_at).toLocaleDateString()}</p>
        <p>Cover Letter: {application.cover_letter_path || 'None'}</p>
        <p>Resume: {application.resume_path || 'None'}</p>
      </div>
    );
  } else {
    return <div>You do not have permission to view this application.</div>;
  }
}
