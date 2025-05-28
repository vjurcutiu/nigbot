import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import jobService from '../../services/jobService';

export default function JobApplyForm() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [resumePath, setResumePath] = useState('');
  const [coverLetterPath, setCoverLetterPath] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const application = await jobService.applyToJob(jobId, {
        candidate_id: user.candidateId,
        resume_path: resumePath || null,
        cover_letter_path: coverLetterPath || null,
      });
      setSubmitting(false);
      // Redirect to application details page
      navigate(`/applications/${application.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit application');
      setSubmitting(false);
    }
  };

  if (!user || !user.candidateId) {
    return <div>You must be logged in as a candidate to apply for this job.</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Apply for Job #{jobId}</h2>
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

        {error && <div className="text-red-600">{error}</div>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}
