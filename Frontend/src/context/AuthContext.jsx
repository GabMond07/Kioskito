import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:5000';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(localStorage.getItem('access_token') || null);
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refresh_token') || null);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [hasActiveSubscription, setHasActiveSubscription] = useState(() => {
    return localStorage.getItem('has_active_subscription') === 'true';
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const validateAuth = async () => {
      if (accessToken && user) {
        try {
          setIsLoading(true);
          const decoded = jwtDecode(accessToken);
          const isExpired = decoded.exp * 1000 < Date.now();

          let validAccessToken = accessToken;
          if (isExpired) {
            validAccessToken = await refreshAccessToken();
          }

          const userResponse = await axios.get(`${API_URL}/users/${user.id}`, {
            headers: { Authorization: `Bearer ${validAccessToken}` },
          });

          const updatedUser = userResponse.data;
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));

          const subscriptionStatus = await checkSubscriptionStatus(user.id, validAccessToken);
          setHasActiveSubscription(subscriptionStatus);
          localStorage.setItem('has_active_subscription', subscriptionStatus.toString());
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
      const response = await axios.post(`${API_URL}/users/login`, { email, password });
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

      const subscriptionStatus = await checkSubscriptionStatus(userId, access_token);
      setHasActiveSubscription(subscriptionStatus);
      localStorage.setItem('has_active_subscription', subscriptionStatus.toString());

      return { success: true, hasActiveSubscription: subscriptionStatus };
    } catch (err) {
      throw new Error(err.response?.data?.detail || 'Error al iniciar sesión');
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/users/register`, {
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

      setHasActiveSubscription(false);
      localStorage.setItem('has_active_subscription', 'false');

      return { success: true, hasActiveSubscription: false };
    } catch (err) {
      throw new Error(err.response?.data?.detail || 'Error al registrarse');
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${API_URL}/users/logout`,
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
      localStorage.removeItem('has_active_subscription');
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      setHasActiveSubscription(false);
    }
  };

  const refreshAccessToken = async () => {
    try {
      const response = await axios.post(`${API_URL}/users/refresh`, { refresh_token: refreshToken });
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

  const checkSubscriptionStatus = async (userId, token) => {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}/subscription/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.has_active_subscription;
    } catch (err) {
      console.error('Failed to check subscription status:', err);
      return false;
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
        hasActiveSubscription,
        login,
        register,
        logout,
        api,
        checkSubscriptionStatus,
        setHasActiveSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};