
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';

export default function RedirectToProfile({ role }) {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user.loading) {
      // Adjust property names to match actual user object keys
      const userId = user.user_id || user.userId;
      const userRole = user.role;

      if (user && userId && userRole === role) {
        navigate(`/${role}/${userId}`, { replace: true });
      } else if (!userId && !user.loading) {
        // Only redirect to login if user is definitely not logged in
        navigate('/login', { replace: true });
      }
      // else do nothing if user data is incomplete but loading is false
    }
  }, [user, role, navigate]);

  return null;
}
