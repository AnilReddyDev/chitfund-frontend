// src/components/group/CreateGroupModal.jsx
import { useContext, useState } from "react";
import api from "../../services/api";
import { CalendarDays, IndianRupee, Users, X } from "lucide-react";
import { AppContext } from "../../context/AppContext";

export default function CreateGroupModal({ onClose, refresh }) {
  const { t } = useContext(AppContext);
  const [form, setForm] = useState({
    name: "",
    totalAmount: "",
    monthlyPremium: "",
    totalMembers: "",
    duration: "",
    startMonth: "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    try {
      setSaving(true);
      await api.post("/groups", {
        name: form.name,
        totalAmount: Number(form.totalAmount),
        monthlyPremium: Number(form.monthlyPremium),
        totalMembers: Number(form.totalMembers),
        duration: Number(form.duration),
        startMonth: form.startMonth,
      });

      await refresh();
      onClose();
    } catch (err) {
      console.error(err);
      alert(t("groupsLoadError"));
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
              {t("newGroup")}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              {t("createChittiGroup")}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close create group"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <Field
            label={t("groupName")}
            name="name"
            placeholder="Eg: Sankranti Chitti"
            value={form.name}
            onChange={handleChange}
          />

          <div className="grid grid-cols-2 gap-3">
            <Field
              icon={<IndianRupee size={16} />}
              label={t("totalAmount")}
              name="totalAmount"
              type="number"
              value={form.totalAmount}
              onChange={handleChange}
            />
            <Field
              icon={<IndianRupee size={16} />}
              label={t("monthlyPremium")}
              name="monthlyPremium"
              type="number"
              value={form.monthlyPremium}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field
              icon={<Users size={16} />}
              label={t("members")}
              name="totalMembers"
              type="number"
              value={form.totalMembers}
              onChange={handleChange}
            />
            <Field
              icon={<CalendarDays size={16} />}
              label={t("duration")}
              name="duration"
              type="number"
              value={form.duration}
              onChange={handleChange}
            />
          </div>

          <Field
            icon={<CalendarDays size={16} />}
            label={t("paymentStartMonth")}
            name="startMonth"
            type="date"
            value={form.startMonth}
            onChange={handleChange}
          />
        </div>

        <button
          type="button"
          onClick={handleCreate}
          disabled={saving}
          className="mt-5 w-full rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {saving ? t("creating") : t("createGroup")}
        </button>
      </div>
    </div>
  );
}

function Field({ icon, label, name, type = "text", placeholder, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
        {icon}
        {label}
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
      />
    </label>
  );
}
