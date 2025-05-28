import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import api from '../../services/api';

export default function ApplicationPortal() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [resumePath, setResumePath] = useState('');
  const [coverLetterPath, setCoverLetterPath] = useState('');

  useEffect(() => {
    async function fetchJob() {
      setLoadingJob(true);
      try {
        const response = await api.get(`/jobs/${jobId}`);
        setJob(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load job details');
      } finally {
        setLoadingJob(false);
      }
    }
    fetchJob();
  }, [jobId]);

  if (loadingJob) return <div>Loading job details...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!user || user.loading) return <div>Loading user info...</div>;
  if (!user.candidateId) return <div>You must be a candidate to apply for this job.</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      await api.post(`/jobs/${jobId}/apply`, {
        candidate_id: user.candidateId,
        resume_path: resumePath || null,
        cover_letter_path: coverLetterPath || null,
      });
      setSubmitting(false);
      // Redirect or show success message
      navigate('/marketplace', { replace: true });
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to submit application');
      setSubmitting(false);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Apply for: {job.title}</h2>
      <p className="mb-4">{job.description}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="resumePath" className="block font-medium mb-1">Resume Path (optional)</label>
          <input
            type="text"
            id="resumePath"
            value={resumePath}
            onChange={(e) => setResumePath(e.target.value)}
            placeholder="Path or URL to your resume"
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label htmlFor="coverLetterPath" className="block font-medium mb-1">Cover Letter Path (optional)</label>
          <input
            type="text"
            id="coverLetterPath"
            value={coverLetterPath}
            onChange={(e) => setCoverLetterPath(e.target.value)}
            placeholder="Path or URL to your cover letter"
            className="w-full border rounded p-2"
          />
        </div>

        {submitError && <div className="text-red-600">{submitError}</div>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </>
  );
}
