import React, { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Header } from './Header';
import { UserContext } from '../../contexts/UserContext';
import './Layout.css';

export function Layout({ allowedRoles, allowAnyAuthenticated }) {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || (!allowAnyAuthenticated && !allowedRoles.includes(user.role))) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <Header userName={user?.username} userId={user?.userId} role={user?.role} />
      <main>
        <Outlet />
      </main>
    </>
  );
}
