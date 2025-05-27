import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import AuthEntry from './components/AuthEntry';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import ClientPortal from './components/profiles/ClientPortal';
import CandidatePortal from './components/profiles/CandidatePortal';
import Marketplace from './components/marketplace/Marketplace';
import Inbox from './components/chat/Inbox';

function App() {
  const [role, setRole] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        {/* Entry point */}
        <Route path="/" element={<AuthEntry />} />

        {/* Auth */}
        <Route path="/login" element={<LoginForm onLogin={setRole} />} />
        <Route path="/signup" element={<SignupForm />} />

        {/* Protected */}
        <Route
          path="/client/*"
          element={role === 'client' ? <ClientPortal /> : <Navigate to="/" />}
        />
        <Route
          path="/candidate/*"
          element={role === 'candidate' ? <CandidatePortal /> : <Navigate to="/" />}
        />

        {/* Chat */}
        <Route path="/chat" element={<Inbox />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />

        {/* Marketplace */}
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/companies/:companyId"  />
        <Route path="/candidates/:candidateId" />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
