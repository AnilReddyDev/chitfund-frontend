import { useContext, useState } from "react";
import { Phone, User, X } from "lucide-react";
import api from "../../services/api";
import { AppContext } from "../../context/AppContext";

export default function AddMemberModal({ onClose, refresh }) {
  const { t } = useContext(AppContext);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) {
      alert(t("memberName"));
      return;
    }

    try {
      setSaving(true);
      await api.post("/members", { name: name.trim(), phone: phone.trim() });
      await refresh();
      onClose();
    } catch (err) {
      console.error("Error adding member", err);
      alert(t("membersLoadError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-slate-950/60 px-3 pb-3 backdrop-blur-sm">
      <div className="w-full rounded-lg bg-white p-4 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-orange-600">
              {t("newMember")}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              {t("addMember")}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close add member"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <Field
            icon={<User size={16} />}
            label={t("name")}
            placeholder={t("memberName")}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Field
            icon={<Phone size={16} />}
            label={t("phone")}
            placeholder={t("phoneNumber")}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={saving}
          className="mt-5 w-full rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {saving ? t("adding") : t("addMember")}
        </button>
      </div>
    </div>
  );
}

function Field({ icon, label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
        {icon}
        {label}
      </span>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
      />
    </label>
  );
}
