import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();


const persistSession = (sessionData) => {
  localStorage.setItem('blood_bank_token', sessionData.token);
  localStorage.setItem('blood_bank_user', JSON.stringify(sessionData.user));
};

const clearSession = () => {
  localStorage.removeItem('blood_bank_token');
  localStorage.removeItem('blood_bank_user');
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profileDetails, setProfileDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('blood_bank_token');
      const storedUser = JSON.parse(localStorage.getItem('blood_bank_user') || 'null');

      if (!token) {
        setUser(storedUser);
        setProfileDetails(null);
        setLoading(false);
        return;
      }

      if (token.startsWith('demo-')) {
        clearSession();
        setUser(null);
        setProfileDetails(null);
        setLoading(false);
        return;
      }

      const res = await api.get('/auth/profile');
      if (res.data.success) {
        setUser(res.data.user);
        setProfileDetails(res.data.profileDetails);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      clearSession();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const loginUser = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        persistSession({ token: res.data.token, user: res.data.user });
        setUser(res.data.user);
        await fetchProfile();
        return res.data;
      }
      throw new Error(res.data.message || 'Login failed');
    } catch (error) {
      throw error;
    }
  };

  const registerUser = async (registrationData) => {
    try {
      const res = await api.post('/auth/register', registrationData);
      if (res.data.success) {
        persistSession({ token: res.data.token, user: res.data.user });
        setUser(res.data.user);
        await fetchProfile();
        return res.data;
      }
      throw new Error(res.data.message || 'Registration failed');
    } catch (error) {
      throw error;
    }
  };

  const logoutUser = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore error on logout
    }
    clearSession();
    setUser(null);
    setProfileDetails(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profileDetails,
        loading,
        loginUser,
        registerUser,
        logoutUser,
        refetchProfile: fetchProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
