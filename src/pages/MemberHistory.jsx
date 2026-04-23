import { useEffect, useState } from "react";
import api from "../services/api";
import FAB from "../components/ui/FAB";
import AddMemberModal from "../components/member/AddMemberModal";

export default function MemberHistory() {
  const [members, setMembers] = useState([]);
  const [open, setOpen] = useState(false);

  const fetchMembers = async () => {
    const res = await api.get("/members");
    setMembers(res.data);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <div className="p-4">
      {members.map((m) => (
         <div
            key={m.id}
            className="bg-white p-4 rounded-xl shadow mb-3"
          >{m.name}</div>
      ))}

      <FAB onClick={() => setOpen(true)} />

      {open && (
        <AddMemberModal
          onClose={() => setOpen(false)}
          refresh={fetchMembers}
        />
      )}
    </div>
  );
}