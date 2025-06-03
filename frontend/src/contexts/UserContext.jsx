import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({ userId: null, candidateId: null, role: null, username: null, company: null, loading: true });

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      const userId = response.data.user_id;
      const role = response.data.role;
      const username = response.data.username;

      let candidateId = null;
      let company = null;
      if (role === 'candidate') {
        const candidateResponse = await api.get('/candidate/profile');
        candidateId = candidateResponse.data.profile?.id || null;
      } else if (role === 'client') {
        const companyResponse = await api.get('/client/');
        company = companyResponse.data.company || null;
      }

      setUser({
        userId,
        candidateId,
        role,
        username,
        company,
        loading: false,
      });
    } catch (error) {
      setUser({ userId: null, candidateId: null, role: null, username: null, company: null, loading: false });
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = (userData) => {
    setUser({ ...userData, loading: false });
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser({ userId: null, candidateId: null, role: null, username: null, company: null, loading: false });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const refreshUser = () => {
    setUser((prev) => ({ ...prev, loading: true }));
    fetchUser();
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, logout, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};
