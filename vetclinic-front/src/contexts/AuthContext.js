import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const id_account = localStorage.getItem('id_account');
    const role = localStorage.getItem('role');
    const id_emp = localStorage.getItem('id_emp');
    return token && id_account ? {
      token,
      id_account: Number(id_account),
      role: Number(role),
      id_emp: id_emp ? Number(id_emp) : null
    } : null;
  });

  const [loadingUser, setLoadingUser] = useState(true); 

  useEffect(() => {
    const token = localStorage.getItem('token');
    const id_account = localStorage.getItem('id_account');
    const role = localStorage.getItem('role');
    const id_emp = localStorage.getItem('id_emp');

    if (token && id_account) {
      setUser({
        token,
        id_account: Number(id_account),
        role: Number(role),
        id_emp: id_emp ? Number(id_emp) : null
      });
    }
    setLoadingUser(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('id_account', userData.id_account);
    localStorage.setItem('role', userData.role);

    if (userData.id_emp) {
      localStorage.setItem('id_emp', userData.id_emp);
    } else {
      localStorage.removeItem('id_emp');
    }

    setUser({
      token: userData.token,
      id_account: userData.id_account,
      role: userData.role,
      id_emp: userData.id_emp || null
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('id_account');
    localStorage.removeItem('role');
    localStorage.removeItem('id_emp');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loadingUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
