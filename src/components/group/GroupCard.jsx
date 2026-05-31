// src/components/group/GroupCard.jsx
import { ArrowRight, CalendarDays, IndianRupee, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GroupCard({ group }) {
  const navigate = useNavigate();
  const totalAmount = formatCurrency(group.totalAmount);
  const premium = formatCurrency(group.monthlyPremium);
  const memberCount = group.totalMembers ?? group.membersCount ?? "-";
  const duration = group.duration ? `${group.duration} mo` : "-";

  return (
    <button
      type="button"
      onClick={() => navigate(`/group/${group.id}/members`)}
      className="w-full rounded-lg border border-white/20 bg-white p-4 text-left shadow-sm transition active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Group
          </p>
          <h2 className="mt-1 truncate text-lg font-semibold text-slate-950">
            {group.name || "Untitled group"}
          </h2>
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-700">
          <ArrowRight size={18} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <Metric icon={<IndianRupee size={15} />} label="Amount" value={totalAmount} />
        <Metric icon={<Users size={15} />} label="Members" value={memberCount} />
        <Metric icon={<CalendarDays size={15} />} label="Duration" value={duration} />
      </div>

      {group.monthlyPremium != null && (
        <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Monthly premium: <span className="font-semibold">{premium}</span>
        </div>
      )}
    </button>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="min-w-0 rounded-lg bg-slate-50 p-3">
      <div className="flex items-center gap-1.5 text-slate-400">
        {icon}
        <span className="truncate text-[11px] font-medium">{label}</span>
      </div>
      <p className="mt-1 truncate text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function formatCurrency(value) {
  if (value == null || value === "") return "-";
  const numberValue = Number(value);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numberValue) ? numberValue : 0);
}
