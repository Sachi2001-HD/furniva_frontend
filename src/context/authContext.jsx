import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const isExpired = (token) => {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(base64));
    return !exp || exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const emptySession = { token: null, user: null };

const readSession = () => {
  try {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user || isExpired(token)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return emptySession;
    }

    return { token, user };
  } catch {
    return emptySession;
  }
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);
  const { token, user } = session;

  const login = (newToken, newUser) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setSession({ token: newToken, user: newUser });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setSession(emptySession);
  };

  return (
    <AuthContext.Provider
      value={{ token, user, isLoggedIn: !!token && !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }

  return context;
}