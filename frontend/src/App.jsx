import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthEntry from './components/AuthEntry';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import ClientPortal from './components/profiles/ClientPortal';
import CandidatePortal from './components/profiles/CandidatePortal';
import Marketplace from './components/marketplace/Marketplace';
import Inbox from './components/chat/Inbox';
import { Layout } from './components/ui/Layout';
import JobPortal from './components/profiles/JobPortal';
import { UserProvider, UserContext } from './contexts/UserContext';
import RedirectToProfile from './components/ui/RedirectToProfile';

function AppRoutes() {
  const { user, setUser } = useContext(UserContext);

  if (user.loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {/* Entry point */}
      <Route path="/" element={<AuthEntry />} />

      {/* Auth */}
      <Route path="/login" element={<LoginForm onLogin={setUser} />} />
      <Route path="/signup" element={<SignupForm />} />

      {/* Protected with Layout */}
      <Route element={<Layout allowedRoles={['client']} />}>
        <Route path="/client" element={<RedirectToProfile role="client" />} />
        <Route path="/client/:userId" element={<ClientPortal />} />
        <Route path="/job/:jobId" element={<JobPortal />} />
        <Route path="/jobs/:jobId" element={<JobPortal />} />
      </Route>
      <Route element={<Layout allowedRoles={['candidate']} />}>
        <Route path="/candidate" element={<RedirectToProfile role="candidate" />} />
        <Route path="/candidate/:userId" element={<CandidatePortal />} />
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
  );
}

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
