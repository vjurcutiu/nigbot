import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

export default function CompaniesList() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const res = await api.get('/companies');
        setCompanies(res.data.companies || []);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCompanies();
  }, []);

  if (loading) return <div>Loading companies...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Companies</h2>
      {companies.length > 0 ? (
        <ul className="space-y-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {companies.map(company => (
            <li key={company.id} className="p-4 border rounded-lg shadow-sm">
              <h3 className="text-base font-medium">{company.name}</h3>
              <p className="text-sm text-gray-600">{company.industry}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div>No companies found</div>
      )}
    </div>
  );
}

