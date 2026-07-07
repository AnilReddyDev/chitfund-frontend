import { BarChart, FileClock, Gavel, Home, List, Settings, Users } from "lucide-react";
import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import useGroup from "../../hooks/useGroup";
import { AppContext } from "../../context/AppContext";
import { hasAnyPermission, PERMISSIONS } from "../../utils/permissions";
import { translate } from "../../utils/i18n";

const BottomNav = () => {
  const groupId = useGroup();
  const { pathname } = useLocation();
  const { role, t = (key, values) => translate("en", key, values) } =
    useContext(AppContext);

  const items = [
    { to: "/", icon: <Home size={21} />, label: t("groups"), permissions: [PERMISSIONS.GROUP_VIEW] },
    { to: groupId ? `/group/${groupId}/ledger` : "/", icon: <List size={21} />, label: t("ledger"), permissions: [PERMISSIONS.REPORT_VIEW, PERMISSIONS.PAYMENT_VIEW] },
    { to: groupId ? `/group/${groupId}/dashboard` : "/", icon: <BarChart size={21} />, label: t("dashboard"), permissions: [PERMISSIONS.DASHBOARD_VIEW] },
    { to: "/members", icon: <Users size={21} />, label: t("members"), permissions: [PERMISSIONS.MEMBER_VIEW] },
    { to: groupId ? `/group/${groupId}/auction` : "/", icon: <Gavel size={21} />, label: t("auction"), permissions: [PERMISSIONS.AUCTION_VIEW] },
    { to: "/settings/audit-logs", icon: <FileClock size={21} />, label: t("audit"), permissions: [PERMISSIONS.AUDIT_VIEW] },
    { to: "/settings/users", icon: <Settings size={21} />, label: t("users"), permissions: [PERMISSIONS.USER_MANAGE] },
  ].filter((item) => hasAnyPermission(item.permissions, role));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/20 bg-slate-950/90 px-2 py-2 text-white backdrop-blur-xl">
      <div
        className="mx-auto grid max-w-lg gap-1"
        style={{ gridTemplateColumns: `repeat(${Math.max(items.length, 1)}, minmax(0, 1fr))` }}
      >
        {items.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);

          return (
            <Link
              key={item.label}
              to={item.to}
              aria-label={item.label}
              title={item.label}
              className={`grid h-12 place-items-center rounded-lg transition ${
                active ? "bg-white text-slate-950" : "text-white/70 active:bg-white/10"
              }`}
            >
              {item.icon}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
