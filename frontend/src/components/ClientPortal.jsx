// frontend/src/components/ClientPortal.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { Link, Routes, Route } from 'react-router-dom';

export default function ClientPortal() {
  const [overview, setOverview] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchClient() {
      try {
        const [ovRes, dataRes] = await Promise.all([
          api.get('/client'),
          api.get('/client/data'),
        ]);
        setOverview(ovRes.data);
        setData(dataRes.data.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchClient();
  }, []);

  if (loading) return <div>Loading client portal...</div>;
  if (error)   return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Client Dashboard</h1>
      <pre className="mb-6">{JSON.stringify(overview, null, 2)}</pre>
      <h2 className="text-lg font-medium mb-2">Your Data</h2>
      {data.length ? (
        <ul className="list-disc pl-5">
          {data.map((item, idx) => <li key={idx}>{JSON.stringify(item)}</li>)}
        </ul>
      ) : (
        <div>No data available</div>
      )}

      <nav className="mt-6">
        <Link to="/client/settings" className="mr-4 underline">Settings</Link>
        <Link to="/client/reports" className="underline">Reports</Link>
      </nav>

      <Routes>
        <Route path="settings" element={<div>Settings page (TODO)</div>} />
        <Route path="reports" element={<div>Reports page (TODO)</div>} />
      </Routes>
    </div>
  );
}