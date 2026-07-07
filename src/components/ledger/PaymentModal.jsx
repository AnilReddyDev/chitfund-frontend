import { useContext, useState } from "react";
import { IndianRupee, X } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { AppContext } from "../../context/AppContext";

export default function PaymentModal({
  memberId,
  month,
  groupId,
  onClose,
  onSuccess,
}) {
  const { t } = useContext(AppContext);
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("CASH");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount) {
      return toast.error(t("enterAmount"));
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

      toast.success(t("paymentRecorded"));
      await onSuccess();
      onClose();
    } catch (err) {
      console.error("Error recording payment", err);
      toast.error(t("alreadyPaidOrError"));
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
              {t("month")} {month}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              {t("payment")}
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
              {t("amount")}
            </span>
            <input
              type="number"
              value={amount}
              placeholder={t("amount")}
              className="field-input"
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-500">
              {t("mode")}
            </span>
            <select
              value={mode}
              className="field-input"
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="CASH">{t("cash")}</option>
              <option value="UPI">UPI</option>
              <option value="BANK">{t("bank")}</option>
            </select>
          </label>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="mt-5 w-full rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? t("processing") : t("confirm")}
        </button>
      </div>
    </div>
  );
}
