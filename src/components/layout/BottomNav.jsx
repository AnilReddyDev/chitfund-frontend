import { BarChart, Gavel, Home, List, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import useGroup from "../../hooks/useGroup";

const BottomNav = () => {
  const groupId = useGroup();
  const { pathname } = useLocation();

  const items = [
    { to: "/", icon: <Home size={21} />, label: "Groups" },
    { to: groupId ? `/group/${groupId}/ledger` : "/", icon: <List size={21} />, label: "Ledger" },
    { to: groupId ? `/group/${groupId}/dashboard` : "/", icon: <BarChart size={21} />, label: "Dashboard" },
    { to: "/members", icon: <Users size={21} />, label: "Members" },
    { to: groupId ? `/group/${groupId}/auction` : "/", icon: <Gavel size={21} />, label: "Auction" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/20 bg-slate-950/90 px-2 py-2 text-white backdrop-blur-xl">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
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
