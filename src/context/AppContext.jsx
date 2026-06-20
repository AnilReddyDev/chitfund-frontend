import { useState } from "react";
import { AppContext } from "./AppContext";
import { authService } from "../services/auth";

export const AppProvider = ({ children }) => {
  const storedToken = authService.getToken();
  const storedUser = storedToken ? authService.getUser() : null;
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [groupId, setGroupId] = useState(null);
  const [user, setUser] = useState(storedUser);
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(storedToken && storedUser),
  );
  const loading = false;

  // ➕ Add Group
  const addGroup = (group) => {
    setGroups((prev) => [...prev, { id: Date.now(), ...group }]);
  };

  // ➕ Add Member
  const addMember = (member) => {
    setMembers((prev) => [...prev, { id: Date.now(), ...member }]);
  };

  // 🔐 Login
  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      setUser({ username: response.username, role: response.role });
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      setIsAuthenticated(false);
      throw error;
    }
  };

  // 🔓 Logout
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setGroups([]);
    setMembers([]);
    setGroupId(null);
  };

  return (
    <AppContext.Provider
      value={{
        groups,
        addGroup,
        members,
        addMember,
        groupId,
        setGroupId,
        user,
        isAuthenticated,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
