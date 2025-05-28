import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({ userId: null, role: null, username: null, loading: true });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser({
          userId: response.data.user_id,
          role: response.data.role,
          username: response.data.username,
          loading: false,
        });
      } catch (error) {
        setUser({ userId: null, role: null, username: null, loading: false });
      }
    };
    fetchUser();
  }, []);

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};
