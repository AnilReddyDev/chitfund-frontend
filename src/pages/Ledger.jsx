// src/pages/Ledger.jsx
import { useContext, useEffect, useState } from "react";
import { AlertCircle, ListChecks } from "lucide-react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import PaymentModal from "../components/ledger/PaymentModal";
import LedgerExport from "../components/ledger/LedgerExport";
import Skeleton from "../components/ui/Skeleton.jsx";
import PageShell, { PageHero, StatePanel } from "../components/layout/PageShell";
import useGroupMeta, { resolveGroupName } from "../hooks/useGroupMeta";
import Can from "../components/auth/Can";
import { AppContext } from "../context/AppContext";
import { PERMISSIONS, hasPermission } from "../utils/permissions";

export default function Ledger() {
  const { role, t } = useContext(AppContext);
  const { groupId } = useParams();
  const groupMeta = useGroupMeta();
  const canRecordPayment = hasPermission(PERMISSIONS.PAYMENT_CREATE, role);

  const [members, setMembers] = useState([]);
  const [months, setMonths] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCell, setSelectedCell] = useState(null);

  const applyLedger = (payload) => {
    setMembers(Array.isArray(payload?.members) ? payload.members : []);
    setMonths(Array.isArray(payload?.months) ? payload.months : []);
    setGroupName(resolveGroupName(payload));
    setError("");
  };

  const loadLedger = async ({ showLoading = true } = {}) => {
    if (!groupId) {
      setLoading(false);
      setError(t("selectGroupLedgerError"));
      return;
    }

    try {
      if (showLoading) setLoading(true);
      setError("");
      const res = await api.get("/ledger/full", { params: { groupId } });
      applyLedger(res.data);
    } catch (err) {
      console.error("Error loading ledger", err);
      setError(t("ledgerLoadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    if (!groupId) {
      return undefined;
    }

    api
      .get("/ledger/full", { params: { groupId } })
      .then((res) => {
        if (!active) return;
        applyLedger(res.data);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Error loading ledger", err);
        setError(t("ledgerLoadError"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [groupId, t]);

  const displayGroupName = groupName || groupMeta.displayName;
  const pageSubtitle = groupId
    ? [
        displayGroupName,
        groupMeta.createdLabel ? `Created ${groupMeta.createdLabel}` : "",
      ]
        .filter(Boolean)
        .join(" • ")
    : t("noGroupSelected");

  return (
    <PageShell title={t("ledger")} subtitle={pageSubtitle}>
      <PageHero
        eyebrow={t("paymentTracking")}
        title={t("ledger")}
        description={
          canRecordPayment
            ? t("ledgerDescManage")
            : t("ledgerDescView")
        }
        icon={<ListChecks size={22} />}
      />

      {!groupId && (
        <StatePanel
          icon={<ListChecks size={22} />}
          title={t("noGroupSelected")}
          message={t("openGroupLedgerMessage")}
        />
      )}

      {groupId && loading && <LedgerSkeleton />}

      {groupId && !loading && error && (
        <StatePanel
          icon={<AlertCircle size={22} />}
          title={t("unableLoadLedger")}
          message={error}
          actionLabel={t("retry")}
          onAction={loadLedger}
        />
      )}

      {groupId && !loading && !error && members.length === 0 && (
        <StatePanel
          icon={<ListChecks size={22} />}
          title={t("noLedgerRows")}
          message={t("noLedgerRowsMessage")}
        />
      )}

      {groupId && !loading && !error && members.length > 0 && (
        <section className="rounded-lg border border-white/20 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-950">
                {t("paymentMatrix")}
              </h2>
              <p className="text-xs text-slate-400">
                {t("membersMonths", { members: members.length, months: months.length })}
              </p>
            </div>
            <Can permissions={[PERMISSIONS.REPORT_EXPORT]}>
              <LedgerExport
                groupId={groupId}
                groupName={displayGroupName}
                group={groupMeta.group}
                members={members}
                months={months}
              />
            </Can>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-50 text-slate-500">
                <tr>
                  <th className="border-b border-slate-100 p-3 text-left font-semibold">
                    {t("member")}
                  </th>
                  {months.map((month) => (
                    <th
                      key={month}
                      className="border-b border-slate-100 p-3 text-center font-semibold"
                    >
                      {formatMonth(month)}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {members.map((member) => (
                  <tr key={member.memberId} className="border-b border-slate-100 last:border-0">
                    <td className="whitespace-nowrap p-3 font-medium text-slate-950">
                      {member.name || `${t("member")} ${member.memberId}`}
                    </td>

                    {(member.payments || []).map((payment) => (
                      <td key={payment.month} className="p-2 text-center">
                        <button
                          type="button"
                          disabled={payment.paid}
                          onClick={() =>
                            canRecordPayment &&
                            setSelectedCell({
                              memberId: member.memberId,
                              month: payment.month,
                            })
                          }
                          className={`h-9 w-full rounded-lg border text-sm font-semibold transition ${
                            payment.paid
                              ? "cursor-default border-emerald-200 bg-emerald-50 text-emerald-700"
                              : !canRecordPayment
                                ? "cursor-default border-slate-200 bg-slate-50 text-slate-300"
                              : "border-slate-200 bg-white text-slate-300 active:scale-[0.98]"
                          }`}
                        >
                          {payment.paid ? t("paid") : "-"}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {selectedCell && canRecordPayment && (
        <PaymentModal
          memberId={selectedCell.memberId}
          month={selectedCell.month}
          groupId={groupId}
          onClose={() => setSelectedCell(null)}
          onSuccess={() => loadLedger({ showLoading: false })}
        />
      )}
    </PageShell>
  );
}

function LedgerSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-20 w-full bg-white/80" />
      <Skeleton className="h-64 w-full bg-white/80" />
    </div>
  );
}

function formatMonth(dateStr) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
  });
}
