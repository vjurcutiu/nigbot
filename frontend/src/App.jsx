import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import AuthEntry from './components/AuthEntry';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import ClientPortal from './components/ClientPortal';
import CandidatePortal from './components/CandidatePortal';
import Marketplace from './components/marketplace/Marketplace';

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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />

        <Route path="/marketplace" element={<Marketplace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
