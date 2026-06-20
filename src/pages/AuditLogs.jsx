import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSearch,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import PageShell, { PageHero, StatePanel } from "../components/layout/PageShell";
import Skeleton from "../components/ui/Skeleton";
import { auditService } from "../services/auditService";

const PAGE_SIZE = 20;
const ACTIONS = ["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "EXPORT"];
const ENTITIES = ["Group", "Member", "GroupMember", "Payment", "Auction", "User", "Ledger"];

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    entityType: "",
    action: "",
    performedBy: "",
    startDate: "",
    endDate: "",
  });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const params = useMemo(
    () => ({
      page,
      size: PAGE_SIZE,
      sort: "createdAt,desc",
      search: filters.search || undefined,
      entityType: filters.entityType || undefined,
      action: filters.action || undefined,
      performedBy: filters.performedBy || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    }),
    [filters, page],
  );

  const applyResponse = (payload) => {
    const rows = Array.isArray(payload)
      ? payload
      : payload?.content || payload?.logs || payload?.auditLogs || [];
    setLogs(rows);
    setTotalPages(payload?.totalPages || 1);
    setError("");
  };

  const loadLogs = async ({ showLoading = true } = {}) => {
    try {
      if (showLoading) setLoading(true);
      const data = await auditService.list(params);
      applyResponse(data);
    } catch (err) {
      console.error("Error loading audit logs", err);
      setError("Could not load audit logs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    auditService
      .list(params)
      .then((data) => {
        if (!active) return;
        applyResponse(data);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Error loading audit logs", err);
        setError("Could not load audit logs. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [params]);

  const updateFilter = (key, value) => {
    setPage(0);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const openLog = async (log) => {
    setSelectedLog(log);
    if (!log.id) return;

    try {
      setDrawerLoading(true);
      const details = await auditService.get(log.id);
      setSelectedLog(details);
    } catch (err) {
      console.error("Error loading audit log details", err);
      toast.error("Could not load audit details");
    } finally {
      setDrawerLoading(false);
    }
  };

  const exportLogs = async () => {
    try {
      setExporting(true);
      const data = await auditService.list({
        ...params,
        page: 0,
        size: 1000,
      });
      const rows = Array.isArray(data)
        ? data
        : data?.content || data?.logs || data?.auditLogs || [];
      const { default: ExcelJS } = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Audit Logs");
      sheet.addRow([
        "Timestamp",
        "User",
        "Role",
        "Action",
        "Entity Type",
        "Entity ID",
        "IP Address",
      ]);
      rows.forEach((log) => {
        sheet.addRow([
          timestamp(log),
          actor(log),
          log.performedByRole || log.userRole || "-",
          log.action || "-",
          log.entityType || "-",
          log.entityId || "-",
          log.ipAddress || "-",
        ]);
      });
      sheet.columns.forEach((column) => {
        column.width = 22;
      });
      const buffer = await workbook.xlsx.writeBuffer();
      downloadBlob(
        buffer,
        `audit-logs-${new Date().toISOString().slice(0, 10)}.xlsx`,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      toast.success("Audit logs exported");
    } catch (err) {
      console.error("Error exporting audit logs", err);
      toast.error("Could not export audit logs");
    } finally {
      setExporting(false);
    }
  };

  return (
    <PageShell title="Audit Logs" subtitle="Activity trail">
      <PageHero
        eyebrow="Compliance"
        title="Audit Logs"
        description="Review login, domain changes, exports, and user activity."
        icon={<ShieldCheck size={22} />}
      />

      <section className="mb-4 rounded-lg border border-white/20 bg-white p-3 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="relative block md:col-span-2">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Search audit logs"
              className="field-input pl-9"
            />
          </label>
          <input
            value={filters.performedBy}
            onChange={(event) => updateFilter("performedBy", event.target.value)}
            placeholder="User ID or name"
            className="field-input"
          />
          <select
            value={filters.entityType}
            onChange={(event) => updateFilter("entityType", event.target.value)}
            className="field-input"
          >
            <option value="">All entities</option>
            {ENTITIES.map((entity) => (
              <option key={entity} value={entity}>
                {entity}
              </option>
            ))}
          </select>
          <select
            value={filters.action}
            onChange={(event) => updateFilter("action", event.target.value)}
            className="field-input"
          >
            <option value="">All actions</option>
            {ACTIONS.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={filters.startDate}
              onChange={(event) => updateFilter("startDate", event.target.value)}
              className="field-input"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(event) => updateFilter("endDate", event.target.value)}
              className="field-input"
            />
          </div>
          <button
            type="button"
            onClick={exportLogs}
            disabled={exporting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            <Download size={16} />
            {exporting ? "Exporting..." : "Export Excel"}
          </button>
        </div>
      </section>

      {loading && <AuditSkeleton />}

      {!loading && error && (
        <StatePanel
          icon={<AlertCircle size={22} />}
          title="Unable to load audit logs"
          message={error}
          actionLabel="Retry"
          onAction={loadLogs}
        />
      )}

      {!loading && !error && logs.length === 0 && (
        <StatePanel
          icon={<FileSearch size={22} />}
          title="No audit logs found"
          message="Audit entries matching the current filters will appear here."
        />
      )}

      {!loading && !error && logs.length > 0 && (
        <section className="overflow-hidden rounded-lg border border-white/20 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Entity Type</th>
                  <th className="p-3">Entity ID</th>
                  <th className="p-3">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id || `${log.entityType}-${log.entityId}-${timestamp(log)}`}
                    onClick={() => openLog(log)}
                    className="cursor-pointer border-t border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="p-3 text-slate-600">{timestamp(log)}</td>
                    <td className="p-3 font-semibold text-slate-950">{actor(log)}</td>
                    <td className="p-3 text-slate-500">{log.performedByRole || log.userRole || "-"}</td>
                    <td className="p-3">
                      <span className="rounded-lg bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700">
                        {log.action || "-"}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{log.entityType || "-"}</td>
                    <td className="p-3 font-mono text-xs text-slate-500">{log.entityId || "-"}</td>
                    <td className="p-3 text-slate-500">{log.ipAddress || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </section>
      )}

      {selectedLog && (
        <AuditDrawer
          log={selectedLog}
          loading={drawerLoading}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </PageShell>
  );
}

function AuditDrawer({ log, loading, onClose }) {
  const before = parseJson(log.oldValues || log.before || log.previousValues);
  const after = parseJson(log.newValues || log.after || log.currentValues);

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm">
      <aside className="ml-auto flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-orange-600">
              {log.action || "Audit event"}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">
              {log.entityType || "Entity"} {log.entityId || ""}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              {timestamp(log)} by {actor(log)}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close audit details"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-auto p-4">
          {loading && <Skeleton className="h-48 w-full" />}
          {!loading && (
            <>
              <ChangeSummary before={before} after={after} />
              <JsonPanel title="Before Changes" data={before} />
              <JsonPanel title="After Changes" data={after} />
              {log.userAgent && (
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    User Agent
                  </p>
                  <p className="mt-1 break-words text-sm text-slate-600">
                    {log.userAgent}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

function ChangeSummary({ before, after }) {
  const keys = Array.from(
    new Set([...Object.keys(before || {}), ...Object.keys(after || {})]),
  );
  const changes = keys
    .map((key) => {
      const hasBefore = Object.prototype.hasOwnProperty.call(before || {}, key);
      const hasAfter = Object.prototype.hasOwnProperty.call(after || {}, key);
      if (!hasBefore && hasAfter) return { key, type: "added", value: after[key] };
      if (hasBefore && !hasAfter) return { key, type: "removed", value: before[key] };
      if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
        return { key, type: "updated", value: after[key] };
      }
      return null;
    })
    .filter(Boolean);

  if (changes.length === 0) {
    return (
      <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
        No field-level changes were captured for this event.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {changes.map((change) => (
        <div
          key={`${change.type}-${change.key}`}
          className={`rounded-lg border px-3 py-2 text-sm ${changeClass(change.type)}`}
        >
          <span className="font-semibold capitalize">{change.type}</span>
          <span className="ml-2 font-mono text-xs">{change.key}</span>
        </div>
      ))}
    </div>
  );
}

function JsonPanel({ title, data }) {
  return (
    <section className="rounded-lg border border-slate-100 bg-slate-50 p-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </h3>
      <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-950 p-3 text-xs leading-5 text-slate-100">
        {JSON.stringify(data || {}, null, 2)}
      </pre>
    </section>
  );
}

function Pagination({ page, totalPages, setPage }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-slate-100 p-3">
      <button
        type="button"
        onClick={() => setPage((value) => Math.max(0, value - 1))}
        disabled={page === 0}
        className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-700 disabled:text-slate-300"
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
      </button>
      <p className="text-sm font-semibold text-slate-600">
        Page {page + 1} of {Math.max(totalPages, 1)}
      </p>
      <button
        type="button"
        onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))}
        disabled={page >= totalPages - 1}
        className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-700 disabled:text-slate-300"
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function AuditSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-20 w-full bg-white/80" />
      <Skeleton className="h-80 w-full bg-white/80" />
    </div>
  );
}

function parseJson(value) {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return { value };
  }
}

function changeClass(type) {
  if (type === "added") return "border-emerald-100 bg-emerald-50 text-emerald-800";
  if (type === "removed") return "border-red-100 bg-red-50 text-red-800";
  return "border-amber-100 bg-amber-50 text-amber-800";
}

function actor(log) {
  return log.performedByName || log.username || log.userName || log.performedBy || "-";
}

function timestamp(log) {
  const value = log.createdAt || log.timestamp;
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function downloadBlob(content, fileName, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
