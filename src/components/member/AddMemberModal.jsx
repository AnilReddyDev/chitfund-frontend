import { useState } from "react";
import api from "../../services/api";
import Card from "../ui/Card";
import Button from "../ui/Button";

export default function AddMemberModal({ onClose, refresh }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleAdd = async () => {
    await api.post("/members", { name, phone });
    refresh();
    onClose();
  };

  return (
    <div className="fixed bottom-14 inset-0 bg-black/30 flex items-end shadow-[#ffffff1a_0px_1px_1px_0px_inset,#32325d40_0px_50px_100px_-20px,#0000004d_0px_30px_60px_-30px]">
      <Card className="w-full rounded-t-2xl">
        <input className="input" placeholder="Name" onChange={(e) => setName(e.target.value)} />
        <input className="input" placeholder="Phone" onChange={(e) => setPhone(e.target.value)} />

        <Button onClick={handleAdd}>Add Member</Button>
      </Card>
    </div>
  );
}