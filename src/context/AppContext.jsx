import { useCallback, useState } from "react";
import { AppContext } from "./AppContext";
import { authService } from "../services/auth";
import { translate } from "../utils/i18n";

export const AppProvider = ({ children }) => {
  const storedToken = authService.getToken();
  const storedUser = storedToken ? authService.getUser() : null;
  const storedRole = storedToken ? authService.getRole() : null;
  const storedLanguage = localStorage.getItem("language") || "en";
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [groupId, setGroupId] = useState(null);
  const [token, setToken] = useState(storedToken);
  const [user, setUser] = useState(storedUser);
  const [role, setRole] = useState(storedRole);
  const [language, setLanguageState] = useState(storedLanguage);
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(storedToken && storedUser && storedRole),
  );
  const loading = false;

  const setLanguage = (nextLanguage) => {
    localStorage.setItem("language", nextLanguage);
    setLanguageState(nextLanguage);
  };

  const t = useCallback(
    (key, values) => translate(language, key, values),
    [language],
  );

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
      setToken(response.token);
      setRole(response.role);
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
    setToken(null);
    setUser(null);
    setRole(null);
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
        token,
        user,
        role,
        language,
        setLanguage,
        t,
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
