import { useState } from "react";
import { IndianRupee, X } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function PaymentModal({
  memberId,
  month,
  groupId,
  onClose,
  onSuccess,
}) {
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("CASH");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount) {
      return toast.error("Enter amount");
    }

    try {
      setLoading(true);

      await api.post("/payments", {
        groupId,
        memberId,
        month,
        amount: Number(amount),
        paymentMode: mode,
      });

      toast.success("Payment recorded");
      await onSuccess();
      onClose();
    } catch (err) {
      console.error("Error recording payment", err);
      toast.error("Already paid or error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-slate-950/60 px-3 pb-3 backdrop-blur-sm">
      <div className="w-full rounded-lg bg-white p-4 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-orange-600">
              Month {month}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              Collect Payment
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close payment"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <IndianRupee size={16} />
              Amount
            </span>
            <input
              type="number"
              value={amount}
              placeholder="Amount"
              className="field-input"
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-500">
              Payment Mode
            </span>
            <select
              value={mode}
              className="field-input"
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="BANK">Bank</option>
            </select>
          </label>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="mt-5 w-full rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? "Processing..." : "Confirm"}
        </button>
      </div>
    </div>
  );
}
