import { useState, useEffect } from 'react';
import clientService from '../services/clientService';
import { Link, Routes, Route } from 'react-router-dom';
import Marketplace from './marketplace/Marketplace';

export default function ClientPortal() {
  const [overview, setOverview] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchClientData() {
      try {
        // Fetch dashboard overview
        const overviewRes = await clientService.getDashboard();
        // Fetch client-specific data list
        const dataRes = await clientService.getData();

        setOverview(overviewRes);
        setData(dataRes);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchClientData();
  }, []);

  if (loading) return <div>Loading client portal...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Client Dashboard</h1>

      <section className="mb-6">
        <h2 className="text-lg font-medium">Overview</h2>
        <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(overview, null, 2)}</pre>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-medium">Your Data</h2>
        {data.length ? (
          <ul className="list-disc pl-5">
            {data.map((item, idx) => (
              <li key={idx}>{JSON.stringify(item)}</li>
            ))}
          </ul>
        ) : (
          <div>No data available</div>
        )}
      </section>

      <nav className="mt-6">
        <Link to="/client/settings" className="mr-4 underline">Settings</Link>
        <Link to="/client/reports" className="mr-4 underline">Reports</Link>
        <Link to="/client/marketplace" className="underline">Marketplace</Link>
      </nav>

      <Routes>
        <Route path="settings" element={<div>Settings page (TODO)</div>} />
        <Route path="reports" element={<div>Reports page (TODO)</div>} />
        <Route path="marketplace" element={<Marketplace />} />
      </Routes>
    </div>
  );
}
