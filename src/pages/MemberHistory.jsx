import { useEffect, useState } from "react";
import api from "../services/api";
import FAB from "../components/ui/FAB";
import AddMemberModal from "../components/member/AddMemberModal";
import Header from "../components/layout/Header";

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
    <div className=" min-h-screen bg-gradient-to-b from-orange-600 to-orange-400">
      <Header title="All Members" />
      {members.map((m) => (
         <div
            key={m.id}
            className="bg-white p-4 m-4 rounded-lg mb-3 shadow-[#ffffff1a_0px_1px_1px_0px_inset,#32325d40_0px_50px_100px_-20px,#0000004d_0px_30px_60px_-30px]"
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