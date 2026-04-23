import { useState } from "react";
import { AppContext } from "./AppContext";

export const AppProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);

  const [groupId, setGroupId] = useState(null);

  // ➕ Add Group
  const addGroup = (group) => {
    setGroups((prev) => [...prev, { id: Date.now(), ...group }]);
  };

  // ➕ Add Member
  const addMember = (member) => {
    setMembers((prev) => [...prev, { id: Date.now(), ...member }]);
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};