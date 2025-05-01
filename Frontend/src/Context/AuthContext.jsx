import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:5000';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage for faster rendering
  const [accessToken, setAccessToken] = useState(localStorage.getItem('access_token') || null);
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refresh_token') || null);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(false); // Only true during async validation

  // Validate stored tokens and user data on mount
  useEffect(() => {
    const validateAuth = async () => {
      if (accessToken && user) {
        try {
          setIsLoading(true);
          const decoded = jwtDecode(accessToken);
          const isExpired = decoded.exp * 1000 < Date.now();

          let validAccessToken = accessToken;
          if (isExpired) {
            // Try to refresh token
            validAccessToken = await refreshAccessToken();
          }

          // Validate user data
          const userResponse = await axios.get(`${API_URL}/users/${user.id}`, {
            headers: { Authorization: `Bearer ${validAccessToken}` },
          });

          // Update user if backend data differs
          const updatedUser = userResponse.data;
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (err) {
          console.error('Auth validation failed:', err);
          logout();
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    validateAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const { access_token, refresh_token } = response.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      setAccessToken(access_token);
      setRefreshToken(refresh_token);

      const decoded = jwtDecode(access_token);
      const userId = parseInt(decoded.sub);

      const userResponse = await axios.get(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const userData = userResponse.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true };
    } catch (err) {
      throw new Error(err.response?.data?.detail || 'Error al iniciar sesión');
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/register`, {
        username,
        email,
        password,
      });
      const { access_token, refresh_token } = response.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      setAccessToken(access_token);
      setRefreshToken(refresh_token);

      const decoded = jwtDecode(access_token);
      const userId = parseInt(decoded.sub);

      const userResponse = await axios.get(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const userData = userResponse.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true };
    } catch (err) {
      throw new Error(err.response?.data?.detail || 'Error al registrarse');
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${API_URL}/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
    }
  };

  const refreshAccessToken = async () => {
    try {
      const response = await axios.post(`${API_URL}/refresh`, { refresh_token: refreshToken });
      const { access_token, refresh_token: newRefreshToken } = response.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', newRefreshToken);
      setAccessToken(access_token);
      setRefreshToken(newRefreshToken);

      return access_token;
    } catch (err) {
      logout();
      throw new Error('Sesión expirada. Por favor, inicia sesión de nuevo.');
    }
  };

  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  api.interceptors.request.use(
    async (config) => {
      if (accessToken) {
        const decoded = jwtDecode(accessToken);
        const isExpired = decoded.exp * 1000 < Date.now();

        if (isExpired) {
          const newAccessToken = await refreshAccessToken();
          config.headers.Authorization = `Bearer ${newAccessToken}`;
        } else {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        isLoading,
        login,
        register,
        logout,
        api,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};