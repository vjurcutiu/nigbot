import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AuthEntry from './components/AuthEntry';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import ClientPortal from './components/profiles/ClientPortal';
import CandidatePortal from './components/profiles/CandidatePortal';
import Marketplace from './components/marketplace/Marketplace';
import Inbox from './components/chat/Inbox';
import api from './services/api';
import { Layout } from './components/ui/Layout';

function App() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    api.get('/auth/me')
      .then(response => {
        setRole(response.data.role);
      })
      .catch(() => {
        setRole(null);
      });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Entry point */}
        <Route path="/" element={<AuthEntry />} />

        {/* Auth */}
        <Route path="/login" element={<LoginForm onLogin={setRole} />} />
        <Route path="/signup" element={<SignupForm />} />

        {/* Protected with Layout */}
        <Route element={<Layout allowedRoles={['client']} />}>
          <Route path="/client/*" element={<ClientPortal />} />
        </Route>
        <Route element={<Layout allowedRoles={['candidate']} />}>
          <Route path="/candidate/*" element={<CandidatePortal />} />
        </Route>
        <Route element={<Layout allowedRoles={['client', 'candidate']} />}>
          <Route path="/chat" element={<Inbox />} />
          <Route path="/marketplace" element={<Marketplace />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />

        {/* Other routes without layout */}
        <Route path="/companies/:companyId" />
        <Route path="/candidates/:candidateId" />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
