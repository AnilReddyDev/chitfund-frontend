// src/components/group/AssignMemberModal.jsx

import { useContext, useEffect, useState } from "react";
import { Check, Phone, Plus, Users, X } from "lucide-react";
import api from "../../services/api";
import Skeleton from "../ui/Skeleton";
import { AppContext } from "../../context/AppContext";

export default function AssignMemberModal({
  groupId,
  existingMembers,
  onClose,
}) {
  const { t } = useContext(AppContext);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    let active = true;

    api
      .get("/members")
      .then((res) => {
        if (!active) return;
        setMembers(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Error fetching members", err);
        setError(t("membersLoadError"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [t]);

  const existingIds = new Set(existingMembers || []);

  const assign = async (memberId) => {
    try {
      setLoadingId(memberId);

      await api.post("/group-members", {
        groupId,
        memberId,
      });

      onClose();
    } catch (err) {
      console.error("Error assigning member", err);
      alert(t("alreadyPaidOrError"));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-slate-950/60 px-3 pb-3 backdrop-blur-sm">
      <div className="max-h-[82vh] w-full overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-orange-600">
              {t("assignMembers")}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              {t("selectMembers")}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close assign members"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[64vh] space-y-3 overflow-auto p-4">
          {loading && (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          )}

          {!loading && error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {!loading && !error && members.length === 0 && (
            <p className="rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-400">
              {t("noSavedMembers")}
            </p>
          )}

          {!loading && !error && members.map((member) => {
            const isAdded = existingIds.has(member.id);

            return (
              <div
                key={member.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-950">
                    {member.name || t("unnamedMember")}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                    <Phone size={13} />
                    {member.phone || t("noPhone")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => assign(member.id)}
                  disabled={isAdded || loadingId === member.id}
                  className="inline-flex min-w-20 items-center justify-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white disabled:bg-slate-200 disabled:text-slate-500"
                >
                  {isAdded ? <Check size={14} /> : <Plus size={14} />}
                  {isAdded ? t("added") : loadingId === member.id ? t("adding") : t("add")}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
