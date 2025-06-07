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
        console.log("UserContext: fetched candidateId =", candidateId);
      } else if (role === 'client') {
        const companyResponse = await api.get('/client/');
        company = companyResponse.data.company || null;
        console.log("UserContext: fetched company =", company);
      }

      setUser({
        userId,
        candidateId,
        role,
        username,
        company,
        loading: false,
      });
      console.log("UserContext: user state set to", { userId, candidateId, role, username, company });
    } catch (error) {
      console.error("UserContext: fetchUser error", error);
      setUser({ userId: null, candidateId: null, role: null, username: null, company: null, loading: false });
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (userData) => {
    setUser((prev) => ({ ...prev, loading: true }));
    await fetchUser();
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
