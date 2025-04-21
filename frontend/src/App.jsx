import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {useState } from 'react'
import LoginForm from './components/LoginForm';
import ClientPortal from './components/ClientPortal';
import CandidatePortal from './components/CandidatePortal';
import SignupForm from './components/SignupForm';

function App() {
  const [role, setRole] = useState(null);

  // after login, store role in state
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/login" element={<LoginForm onLogin={setRole} />} />
        <Route
          path="/client/*"
          element={role === 'client' ? <ClientPortal /> : <Navigate to="/login" />}
        />
        <Route
          path="/candidate/*"
          element={role === 'candidate' ? <CandidatePortal /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
