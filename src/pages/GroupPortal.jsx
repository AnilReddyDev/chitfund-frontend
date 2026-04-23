import { useEffect, useState } from "react";
import api from "../services/api";
import GroupCard from "../components/group/GroupCard";
import FAB from "../components/ui/FAB";
import CreateGroupModal from "../components/group/CreateGroupModal";
import Header from "../components/layout/Header";

export default function GroupPortal() {
  const [groups, setGroups] = useState([]);
  const [open, setOpen] = useState(false);

  const fetchGroups = async () => {
    const res = await api.get("/groups");
    setGroups(res.data);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-600 to-orange-400">
     <Header title="Groups" />
      {groups.map((g) => (
        <GroupCard key={g.id} group={g} />
      ))}

      <FAB onClick={() => setOpen(true)} />

      {open && (
        <CreateGroupModal
          onClose={() => setOpen(false)}
          refresh={fetchGroups}
        />
      )}
    </div>
  );
}