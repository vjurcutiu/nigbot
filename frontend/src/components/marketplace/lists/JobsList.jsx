import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

export default function JobsList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await api.get('/jobs');
        setJobs(res.data.jobs || []);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  if (loading) return <div>Loading jobs...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Available Jobs</h2>
      {jobs.length > 0 ? (
        <ul className="space-y-2">
          {jobs.map(job => (
            <li key={job.id} className="p-4 border rounded-lg shadow-sm">
              <h3 className="text-base font-medium">{job.title}</h3>
              <p className="text-sm text-gray-600">{job.company}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div>No jobs found</div>
      )}
    </div>
  );
}