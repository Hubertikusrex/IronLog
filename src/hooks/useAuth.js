import { useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, getMe } from '../utils/auth';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    getMe()
      .then(setUser)
      .finally(() => setAuthLoading(false));
  }, []);

  async function login(username, password) {
    setLoginError('');
    try {
      const data = await apiLogin(username, password);
      setUser(data.user);
    } catch (err) {
      setLoginError(err.message || 'Invalid credentials');
    }
  }

  async function logout() {
    await apiLogout();
    setUser(null);
  }

  return { user, authLoading, login, logout, loginError };
}
