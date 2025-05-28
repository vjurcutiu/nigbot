import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({ userId: null, candidateId: null, role: null, username: null, loading: true });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        const userId = response.data.user_id;
        const role = response.data.role;
        const username = response.data.username;

        let candidateId = null;
        if (role === 'candidate') {
          const candidateResponse = await api.get('/candidate/profile');
          candidateId = candidateResponse.data.profile?.id || null;
        }

        setUser({
          userId,
          candidateId,
          role,
          username,
          loading: false,
        });
      } catch (error) {
        setUser({ userId: null, candidateId: null, role: null, username: null, loading: false });
      }
    };
    fetchUser();
  }, []);

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};
