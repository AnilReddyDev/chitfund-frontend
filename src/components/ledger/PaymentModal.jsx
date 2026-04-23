import { useState } from "react";
import api from "../../services/api";

export default function PaymentModal({
  memberId,
  month,
  groupId,
  onClose,
  onSuccess,
}) {
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("CASH");

  const handleSubmit = async () => {
    try {
      await api.post("/payments", {
        groupId,
        memberId,
        month,
        amount: Number(amount),
        paymentMode: mode,
      });

      onSuccess(); // refresh ledger
      onClose();
    } catch (err) {
      alert("Payment already exists");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white p-4 rounded-xl w-80 space-y-3">
        <h2 className="font-semibold">Collect Payment</h2>

        <input
          placeholder="Amount"
          className="input"
          onChange={(e) => setAmount(e.target.value)}
        />

        <select
          className="input"
          onChange={(e) => setMode(e.target.value)}
        >
          <option value="CASH">Cash</option>
          <option value="UPI">UPI</option>
          <option value="BANK">Bank</option>
        </select>

        <button className="btn" onClick={handleSubmit}>
          Confirm
        </button>

        <button onClick={onClose} className="text-sm text-gray-500">
          Cancel
        </button>
      </div>
    </div>
  );
}