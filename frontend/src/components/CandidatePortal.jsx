import { useState, useEffect } from 'react';
import candidateService from '../services/candidateService';
import { Link, Routes, Route } from 'react-router-dom';
import Marketplace from './marketplace/Marketplace';

export default function CandidatePortal() {
  const [fullData, setFullData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCandidateData() {
      try {
        // First, get candidate profile to obtain candidateId
        const profile = await candidateService.getProfile();
        // Then, load full candidate data using candidateId
        const data = await candidateService.getFull(profile.id);
        setFullData(data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCandidateData();
  }, []);

  if (loading) return <div>Loading candidate portal...</div>;
  if (error)   return <div>Error: {error}</div>;

  const { profile, employments = [], documents = [], applications = [], skills = [], educations = [] } = fullData;

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Candidate Dashboard</h1>

      <section className="mb-6">
        <h2 className="text-lg font-medium">Profile</h2>
        <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(profile, null, 2)}</pre>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-medium">Employments</h2>
        {employments.length ? (
          <ul className="list-disc pl-5">
            {employments.map((job) => (
              <li key={job.id}>{job.company_name} — {job.position_title}</li>
            ))}
          </ul>
        ) : (
          <div>No employments added</div>
        )}
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-medium">Documents</h2>
        {documents.length ? (
          <ul className="list-disc pl-5">
            {documents.map((doc) => (
              <li key={doc.id}><a href={doc.url} target="_blank" rel="noopener noreferrer">{doc.name}</a></li>
            ))}
          </ul>
        ) : (
          <div>No documents uploaded</div>
        )}
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-medium">Applications</h2>
        {applications.length ? (
          <ul className="list-disc pl-5">
            {applications.map((app) => (
              <li key={app.id}>{app.position} @ {app.company} (applied on {new Date(app.date_applied).toLocaleDateString()})</li>
            ))}
          </ul>
        ) : (
          <div>No applications found</div>
        )}
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-medium">Skills</h2>
        {skills.length ? (
          <ul className="list-disc pl-5">
            {skills.map((skill) => (
              <li key={skill.id}>{skill.name}</li>
            ))}
          </ul>
        ) : (
          <div>No skills added</div>
        )}
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-medium">Educations</h2>
        {educations.length ? (
          <ul className="list-disc pl-5">
            {educations.map((edu) => (
              <li key={edu.id}>{edu.institution} — {edu.degree} ({edu.start_year}–{edu.end_year || 'present'})</li>
            ))}
          </ul>
        ) : (
          <div>No education records</div>
        )}
      </section>

      <nav className="mt-4">
        <Link to="/candidate/apply" className="mr-4 underline">Apply</Link>
        <Link to="/candidate/settings" className="mr-4 underline">Settings</Link>
        <Link to="/candidate/marketplace" className="underline">Marketplace</Link>
      </nav>

      <Routes>
        <Route path="apply" element={<div>Job application form (TODO)</div>} />
        <Route path="settings" element={<div>Settings page (TODO)</div>} />
        <Route path="marketplace" element={<Marketplace />} />
      </Routes>
    </div>
  );
}
