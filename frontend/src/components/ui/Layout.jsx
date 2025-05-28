import React, { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Header } from './Header';
import api from '../../services/api';

export function Layout({ allowedRoles }) {
  const [userName, setUserName] = useState(null);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then(response => {
        setRole(response.data.role);
        // Fetch user name or company/candidate name
        // For simplicity, assume username is returned here
        setUserName(response.data.username || null);
        setUserId(response.data.user_id || null);
      })
      .catch(() => {
        setRole(null);
        setUserName(null);
        setUserId(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <Header userName={userName} userId={userId} role={role} />
      <main>
        <Outlet />
      </main>
    </>
  );
}
