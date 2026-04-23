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
    <div className="fixed inset-0 bg-black/30 flex items-end">
      <Card className="w-full rounded-t-2xl">
        <input className="input" placeholder="Name" onChange={(e) => setName(e.target.value)} />
        <input className="input" placeholder="Phone" onChange={(e) => setPhone(e.target.value)} />

        <Button onClick={handleAdd}>Add Member</Button>
      </Card>
    </div>
  );
}