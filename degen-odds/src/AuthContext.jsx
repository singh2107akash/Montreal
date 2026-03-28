import { createContext, useContext, useState, useEffect } from 'react';

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

  useEffect(() => {
    if (user) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, [user]);

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

  return (
    <AuthContext.Provider value={{ user, loginAsAdmin, loginAsPlayer, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
