import React, { useEffect, useState } from 'react';
import { fetchCompanies, fetchCandidates } from '../../services/marketplaceService';

export default function Marketplace() {
  const [companies, setCompanies]   = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [error, setError]           = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [cs, cds] = await Promise.all([
          fetchCompanies(),
          fetchCandidates(),
        ]);
        setCompanies(cs);
        setCandidates(cds);
      } catch (err) {
        setError('Unable to load marketplace data.');
      }
    }
    load();
  }, []);

  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="grid gap-8">
      <section>
        <h2 className="text-xl font-bold mb-2">Companies</h2>
        <ul className="space-y-4">
          {companies.map(c => (
            <li key={c.id} className="p-4 border rounded-lg shadow-sm">
              <h3 className="font-semibold">{c.name}</h3>
              <p>{c.bio}</p>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-2">Candidates</h2>
        <ul className="space-y-4">
          {candidates.map(c => (
            <li key={c.id} className="p-4 border rounded-lg shadow-sm">
              <h3 className="font-semibold">{c.full_name}</h3>
              <p>{c.bio}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
