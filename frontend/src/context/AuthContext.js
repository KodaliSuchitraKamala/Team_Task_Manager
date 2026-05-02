import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  axios.defaults.baseURL = 'http://localhost:8080/api';

  // Set up axios interceptor to include token in all requests
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Restore user state from token on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      // For now, we'll decode the token manually since we don't have jwt-decode
      // In a real app, you'd use jwt-decode library
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        setUser({
          id: payload.id || 1,
          username: payload.username || 'user',
          email: payload.email || 'user@example.com',
          role: payload.role || 'MEMBER'
        });
        setToken(storedToken);
      } catch (error) {
        // Token is invalid, clear it
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post('/auth/login', { username, password });
      const { token: newToken, id, username: userName, email, role } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser({ id, username: userName, email, role });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);
      const { token: newToken, id, username: userName, email, role } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser({ id, username: userName, email, role });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
