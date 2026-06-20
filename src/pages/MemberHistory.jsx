import { useContext, useEffect, useState } from "react";
import { AlertCircle, Phone, UserPlus, Users } from "lucide-react";
import api from "../services/api";
import FAB from "../components/ui/FAB";
import AddMemberModal from "../components/member/AddMemberModal";
import Skeleton from "../components/ui/Skeleton";
import PageShell, { PageHero, StatePanel } from "../components/layout/PageShell";
import Can from "../components/auth/Can";
import { AppContext } from "../context/AppContext";
import { PERMISSIONS, hasPermission } from "../utils/permissions";

export default function MemberHistory() {
  const { role } = useContext(AppContext);
  const [members, setMembers] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const canManageMembers = hasPermission(PERMISSIONS.MEMBER_MANAGE, role);

  const applyMembers = (data) => {
    setMembers(Array.isArray(data) ? data : []);
    setError("");
  };

  const fetchMembers = async ({ showLoading = true } = {}) => {
    try {
      if (showLoading) setLoading(true);
      setError("");
      const res = await api.get("/members");
      applyMembers(res.data);
    } catch (err) {
      console.error("Error fetching members", err);
      setError("Could not load members. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    api
      .get("/members")
      .then((res) => {
        if (!active) return;
        applyMembers(res.data);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Error fetching members", err);
        setError("Could not load members. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <PageShell title="All Members" subtitle={`${members.length} saved members`}>
      <PageHero
        eyebrow="Member directory"
        title="Members"
        description="Keep a clean member list that can be assigned to any chit group."
        icon={<Users size={22} />}
      />

      {loading && <MemberSkeleton />}

      {!loading && error && (
        <StatePanel
          icon={<AlertCircle size={22} />}
          title="Unable to load members"
          message={error}
          actionLabel="Retry"
          onAction={fetchMembers}
        />
      )}

      {!loading && !error && members.length === 0 && (
        <StatePanel
          icon={<UserPlus size={22} />}
          title="No members yet"
          message="Add members here first, then assign them to a group."
          actionLabel={canManageMembers ? "Add member" : null}
          onAction={canManageMembers ? () => setOpen(true) : undefined}
        />
      )}

      {!loading && !error && members.length > 0 && (
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="rounded-lg border border-white/20 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold text-slate-950">
                    {member.name || "Unnamed member"}
                  </h2>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
                    <Phone size={14} />
                    {member.phone || "No phone"}
                  </p>
                </div>
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
                  <Users size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Can permissions={[PERMISSIONS.MEMBER_MANAGE]}>
        <FAB onClick={() => setOpen(true)} />
      </Can>

      {open && (
        <AddMemberModal
          onClose={() => setOpen(false)}
          refresh={() => fetchMembers({ showLoading: false })}
        />
      )}
    </PageShell>
  );
}

function MemberSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((item) => (
        <Skeleton key={item} className="h-20 w-full bg-white/80" />
      ))}
    </div>
  );
}
