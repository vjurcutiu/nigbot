import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

export default function CandidatesList() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCandidates() {
      try {
        const res = await api.get('/candidates');
        setCandidates(res.data.candidates || []);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCandidates();
  }, []);

  if (loading) return <div>Loading candidates...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Candidates</h2>
      {candidates.length > 0 ? (
        <ul className="space-y-2">
          {candidates.map(candidate => (
            <li key={candidate.id} className="p-4 border rounded-lg shadow-sm">
              <h3 className="text-base font-medium">{candidate.name}</h3>
              <p className="text-sm text-gray-600">{candidate.role}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div>No candidates found</div>
      )}
    </div>
  );
}
