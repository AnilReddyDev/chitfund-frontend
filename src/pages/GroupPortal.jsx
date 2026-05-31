import { useEffect, useState } from "react";
import { AlertCircle, RefreshCw, Users } from "lucide-react";
import api from "../services/api";
import GroupCard from "../components/group/GroupCard";
import FAB from "../components/ui/FAB";
import CreateGroupModal from "../components/group/CreateGroupModal";
import Skeleton from "../components/ui/Skeleton";
import PageShell, { PageHero, StatePanel } from "../components/layout/PageShell";

export default function GroupPortal() {
  const [groups, setGroups] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const applyGroupsResponse = (data) => {
    setGroups(Array.isArray(data) ? data : []);
    setError("");
  };

  const fetchGroups = async ({ showLoading = true } = {}) => {
    try {
      if (showLoading) setLoading(true);
      setError("");
      const res = await api.get("/groups");
      applyGroupsResponse(res.data);
    } catch (err) {
      console.error("Error fetching groups", err);
      setError("Could not load groups. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    api
      .get("/groups")
      .then((res) => {
        if (!active) return;
        applyGroupsResponse(res.data);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Error fetching groups", err);
        setError("Could not load groups. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <PageShell title="Groups" subtitle={`${groups.length} active groups`}>
      <PageHero
        eyebrow="Chit fund workspace"
        title="Manage Groups"
        description="Track amount, members, premium, and auction duration in one place."
        icon={<Users size={22} />}
      />

      {loading && <GroupSkeleton />}

      {!loading && error && (
        <StatePanel
          icon={<AlertCircle size={22} />}
          title="Unable to load groups"
          message={error}
          actionLabel={
            <>
              <RefreshCw size={16} />
              Retry
            </>
          }
          onAction={fetchGroups}
        />
      )}

      {!loading && !error && groups.length === 0 && (
        <StatePanel
          icon={<Users size={22} />}
          title="No groups yet"
          message="Create your first chit group to start adding members and tracking payments."
          actionLabel="Create group"
          onAction={() => setOpen(true)}
        />
      )}

      {!loading && !error && groups.length > 0 && (
        <div className="space-y-3">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}

      <FAB onClick={() => setOpen(true)} />

      {open && (
        <CreateGroupModal
          onClose={() => setOpen(false)}
          refresh={fetchGroups}
        />
      )}
    </PageShell>
  );
}

function GroupSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="rounded-lg border border-white/20 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="w-full space-y-3">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-7 w-3/4" />
            </div>
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
