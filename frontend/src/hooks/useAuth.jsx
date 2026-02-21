import { createContext, useContext, useState } from "react";

const AuthContext = createContext({
  user: null,
  login: () => { },
  logout: () => { },
});

export const useAuth = () => useContext(AuthContext);

const mockUsers = {
  doctor: { name: "Dr. James Carter", role: "doctor", id: "DOC-042" },
  patient: { name: "Emily Richards", role: "patient", id: "PAT-1087" },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (role) => {
    setUser(mockUsers[role]);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
