// src/components/group/CreateGroupModal.jsx
import { useState } from "react";
import api from "../../services/api";
import Card from "../ui/Card";
import Button from "../ui/Button";

export default function CreateGroupModal({ onClose, refresh }) {
  const [form, setForm] = useState({
    name: "",
    totalAmount: "",
    monthlyPremium: "",
    totalMembers: "",
    duration: "",
    startMonth: "", // ✅ NEW FIELD
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    try {
      await api.post("/groups", {
        name: form.name,
        totalAmount: Number(form.totalAmount),
        monthlyPremium: Number(form.monthlyPremium),
        totalMembers: Number(form.totalMembers),
        duration: Number(form.duration),
        startMonth: form.startMonth, // ✅ important
      });

      refresh();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error creating group");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-end">
      <Card className="w-full rounded-t-2xl space-y-3">
        <h2 className="text-lg font-semibold">Create Chitti Group</h2>

        {/* Name */}
        <div>
          <label className="text-sm text-gray-500">Group Name</label>
          <input
            name="name"
            placeholder="Eg: Sankranti Chitti"
            className="input"
            onChange={handleChange}
          />
        </div>

        {/* Total Amount */}
        <div>
          <label className="text-sm text-gray-500">Total Amount (₹)</label>
          <input
            name="totalAmount"
            type="number"
            className="input"
            onChange={handleChange}
          />
        </div>

        {/* Monthly Premium */}
        <div>
          <label className="text-sm text-gray-500">
            Monthly Premium (₹)
          </label>
          <input
            name="monthlyPremium"
            type="number"
            className="input"
            onChange={handleChange}
          />
        </div>

        {/* Total Members */}
        <div>
          <label className="text-sm text-gray-500">Total Members</label>
          <input
            name="totalMembers"
            type="number"
            className="input"
            onChange={handleChange}
          />
        </div>

        {/* Duration */}
        <div>
          <label className="text-sm text-gray-500">
            Duration (months)
          </label>
          <input
            name="duration"
            type="number"
            className="input"
            onChange={handleChange}
          />
        </div>

        {/* 📅 START MONTH (Calendar Input) */}
        <div>
          <label className="text-sm text-gray-500">
            Payment Start Month
          </label>
          <input
            name="startMonth"
            type="date" // 🔥 THIS ENABLES CALENDAR
            className="input"
            onChange={handleChange}
          />
        </div>

        {/* Button */}
        <Button onClick={handleCreate}>Create Group</Button>

        <button
          onClick={onClose}
          className="text-sm text-gray-500"
        >
          Cancel
        </button>
      </Card>
    </div>
  );
}