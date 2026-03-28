import { createContext, useContext, useState, useEffect } from 'react';
import { hasToken, setToken, clearToken, validateToken } from './github-storage';

const AuthContext = createContext(null);

const ADMIN_NAME = 'Akash';
const ADMIN_PASSWORD = 'montreal';
const SESSION_KEY = 'degen-odds-session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [gameCodeReady, setGameCodeReady] = useState(hasToken());
  const [tokenError, setTokenError] = useState('');
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    if (user) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, [user]);

  const submitGameCode = async (code) => {
    setValidating(true);
    setTokenError('');
    setToken(code.trim());

    const result = await validateToken();
    setValidating(false);

    if (result.valid) {
      setGameCodeReady(true);
      return true;
    } else {
      clearToken();
      setTokenError('Invalid game code. Make sure you copied the full token.');
      return false;
    }
  };

  const loginAsAdmin = (password) => {
    if (password === ADMIN_PASSWORD) {
      setUser({ name: ADMIN_NAME, isAdmin: true });
      return true;
    }
    return false;
  };

  const loginAsPlayer = (name) => {
    setUser({ name, isAdmin: false });
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const fullLogout = () => {
    setUser(null);
    clearToken();
    setGameCodeReady(false);
  };

  return (
    <AuthContext.Provider value={{
      user, gameCodeReady, tokenError, validating,
      submitGameCode, loginAsAdmin, loginAsPlayer, logout, fullLogout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
