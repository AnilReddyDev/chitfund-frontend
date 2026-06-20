// src/pages/GroupMemberHistory.jsx

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Phone, UserPlus, Users } from "lucide-react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import AssignMemberModal from "../components/group/AssignMemberModal";
import FAB from "../components/ui/FAB";
import Skeleton from "../components/ui/Skeleton";
import PageShell, { PageHero, StatePanel } from "../components/layout/PageShell";
import useGroupMeta from "../hooks/useGroupMeta";

export default function GroupMemberHistory() {
  const { groupId } = useParams();
  const groupMeta = useGroupMeta();

  const [members, setMembers] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const memberMap = useMemo(() => {
    return Object.fromEntries(allMembers.map((member) => [member.id, member]));
  }, [allMembers]);

  const applyMembers = (groupMemberData, memberData) => {
    setMembers((Array.isArray(groupMemberData) ? groupMemberData : []).map((member) => member.memberId));
    setAllMembers(Array.isArray(memberData) ? memberData : []);
    setError("");
  };

  const fetchMembers = async ({ showLoading = true } = {}) => {
    if (!groupId) {
      setLoading(false);
      setError("Select a group before opening members.");
      return;
    }

    try {
      if (showLoading) setLoading(true);
      setError("");

      const [groupMemberRes, memberRes] = await Promise.all([
        api.get(`/group-members/${groupId}`),
        api.get("/members"),
      ]);

      applyMembers(groupMemberRes.data, memberRes.data);
    } catch (err) {
      console.error("Error fetching group members", err);
      setError("Could not load group members. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    if (!groupId) {
      return undefined;
    }

    Promise.all([
      api.get(`/group-members/${groupId}`),
      api.get("/members"),
    ])
      .then(([groupMemberRes, memberRes]) => {
        if (!active) return;
        applyMembers(groupMemberRes.data, memberRes.data);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Error fetching group members", err);
        setError("Could not load group members. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [groupId]);

  return (
    <PageShell title="Group Members" subtitle={groupMeta.subtitle}>
      <PageHero
        eyebrow="Group directory"
        title={`${members.length} Members`}
        description="Assign saved members to this group before tracking ledger payments and auctions."
        icon={<Users size={22} />}
      />

      {!groupId && (
        <StatePanel
          icon={<Users size={22} />}
          title="No group selected"
          message="Open a group first, then assign members from that group page."
        />
      )}

      {groupId && loading && <MemberSkeleton />}

      {groupId && !loading && error && (
        <StatePanel
          icon={<AlertCircle size={22} />}
          title="Unable to load members"
          message={error}
          actionLabel="Retry"
          onAction={fetchMembers}
        />
      )}

      {groupId && !loading && !error && members.length === 0 && (
        <StatePanel
          icon={<UserPlus size={22} />}
          title="No members assigned"
          message="Assign members to this group to begin payments and auctions."
          actionLabel="Assign member"
          onAction={() => setOpen(true)}
        />
      )}

      {groupId && !loading && !error && members.length > 0 && (
        <div className="space-y-3">
          {members.map((id) => {
            const member = memberMap[id];

            return (
              <div
                key={id}
                className="rounded-lg border border-white/20 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-slate-950">
                      {member?.name || `Member ${id}`}
                    </h2>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
                      <Phone size={14} />
                      {member?.phone || "No phone"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                    ID {id}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <FAB onClick={() => setOpen(true)} />

      {open && (
        <AssignMemberModal
          groupId={groupId}
          existingMembers={members}
          onClose={() => {
            setOpen(false);
            fetchMembers({ showLoading: false });
          }}
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
