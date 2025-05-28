import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';

export default function RedirectToProfile({ role }) {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user.loading) {
      if (user && user.userId && user.role === role) {
        navigate(`/${role}/${user.userId}`, { replace: true });
      } else {
        // If user not logged in or role mismatch, redirect to login
        navigate('/login', { replace: true });
      }
    }
  }, [user, role, navigate]);

  return null;
}
