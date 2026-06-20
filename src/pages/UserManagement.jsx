import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Edit,
  Search,
  Shield,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import PageShell, { PageHero, StatePanel } from "../components/layout/PageShell";
import Skeleton from "../components/ui/Skeleton";
import { userService } from "../services/userService";
import { ROLES } from "../utils/permissions";

const PAGE_SIZE = 10;

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [savingStatusId, setSavingStatusId] = useState(null);
  const [error, setError] = useState("");
  const [modalUser, setModalUser] = useState(null);

  const params = useMemo(
    () => ({
      page,
      size: PAGE_SIZE,
      search: query || undefined,
      role: roleFilter || undefined,
      sort: "createdAt,desc",
    }),
    [page, query, roleFilter],
  );

  const applyResponse = (payload) => {
    const rows = Array.isArray(payload)
      ? payload
      : payload?.content || payload?.users || [];
    setUsers(rows);
    setTotalPages(payload?.totalPages || 1);
    setError("");
  };

  const loadUsers = async ({ showLoading = true } = {}) => {
    try {
      if (showLoading) setLoading(true);
      const data = await userService.list(params);
      applyResponse(data);
    } catch (err) {
      console.error("Error loading users", err);
      setError("Could not load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    userService
      .list(params)
      .then((data) => {
        if (!active) return;
        applyResponse(data);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Error loading users", err);
        setError("Could not load users. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [params]);

  const handleStatus = async (user) => {
    try {
      setSavingStatusId(user.id);
      await userService.updateStatus(user.id, !isActive(user));
      toast.success("User status updated");
      await loadUsers({ showLoading: false });
    } catch (err) {
      console.error("Error updating user status", err);
      toast.error("Could not update user status");
    } finally {
      setSavingStatusId(null);
    }
  };

  const handleSaved = async () => {
    setModalUser(null);
    await loadUsers({ showLoading: false });
  };

  return (
    <PageShell title="Users" subtitle="Owner settings">
      <PageHero
        eyebrow="User management"
        title="Users"
        description="Manage application access, roles, and active status."
        icon={<Users size={22} />}
      />

      <section className="mb-4 rounded-lg border border-white/20 bg-white p-3 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
          <label className="relative block">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(event) => {
                setPage(0);
                setQuery(event.target.value);
              }}
              placeholder="Search users"
              className="field-input pl-9"
            />
          </label>

          <select
            value={roleFilter}
            onChange={(event) => {
              setPage(0);
              setRoleFilter(event.target.value);
            }}
            className="field-input"
          >
            <option value="">All roles</option>
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {formatRole(role)}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setModalUser({})}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <UserPlus size={16} />
            Create
          </button>
        </div>
      </section>

      {loading && <UserSkeleton />}

      {!loading && error && (
        <StatePanel
          icon={<AlertCircle size={22} />}
          title="Unable to load users"
          message={error}
          actionLabel="Retry"
          onAction={loadUsers}
        />
      )}

      {!loading && !error && users.length === 0 && (
        <StatePanel
          icon={<Users size={22} />}
          title="No users found"
          message="Create a user or adjust the current filters."
          actionLabel="Create user"
          onAction={() => setModalUser({})}
        />
      )}

      {!loading && !error && users.length > 0 && (
        <section className="overflow-hidden rounded-lg border border-white/20 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Last Login</th>
                  <th className="p-3">Created At</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id || user.username} className="border-t border-slate-100">
                    <td className="p-3 font-semibold text-slate-950">
                      {user.name || user.username || "-"}
                    </td>
                    <td className="p-3 text-slate-500">
                      {user.email || user.username || "-"}
                    </td>
                    <td className="p-3">
                      <span className="rounded-lg bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700">
                        {formatRole(user.role)}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => handleStatus(user)}
                        disabled={savingStatusId === user.id}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                          isActive(user)
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {savingStatusId === user.id
                          ? "Saving"
                          : isActive(user)
                            ? "Active"
                            : "Inactive"}
                      </button>
                    </td>
                    <td className="p-3 text-slate-500">{formatDate(user.lastLogin)}</td>
                    <td className="p-3 text-slate-500">{formatDate(user.createdAt)}</td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => setModalUser(user)}
                        className="inline-grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-700"
                        aria-label={`Edit ${user.username || "user"}`}
                      >
                        <Edit size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </section>
      )}

      {modalUser && (
        <UserModal
          user={modalUser}
          onClose={() => setModalUser(null)}
          onSaved={handleSaved}
        />
      )}
    </PageShell>
  );
}

function UserModal({ user, onClose, onSaved }) {
  const editing = Boolean(user.id);
  const [form, setForm] = useState({
    username: user.username || user.email || "",
    name: user.name || "",
    email: user.email || user.username || "",
    password: "",
    role: user.role || "VIEWER",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    try {
      setSaving(true);
      if (editing) {
        await userService.update(user.id, { role: form.role });
        toast.success("User updated");
      } else {
        await userService.create({
          username: form.username || form.email,
          name: form.name || undefined,
          email: form.email || undefined,
          password: form.password,
          role: form.role,
        });
        toast.success("User created");
      }
      await onSaved();
    } catch (err) {
      console.error("Error saving user", err);
      toast.error("Could not save user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-slate-950/60 px-3 pb-3 backdrop-blur-sm">
      <div className="w-full rounded-lg bg-white p-4 shadow-2xl md:mx-auto md:max-w-lg">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-orange-600">
              {editing ? "Edit user" : "New user"}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              {editing ? "Update Access" : "Create User"}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close user form"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          {!editing && (
            <>
              <Field label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
              <Field label="Email" value={form.email} onChange={(value) => setForm({ ...form, email: value, username: value })} />
              <Field label="Password" type="password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} />
            </>
          )}
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Shield size={16} />
              Role
            </span>
            <select
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value })}
              className="field-input"
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {formatRole(role)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="mt-5 w-full rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {saving ? "Saving..." : editing ? "Save Changes" : "Create User"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, type = "text", value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-500">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="field-input"
      />
    </label>
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

function UserSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-20 w-full bg-white/80" />
      <Skeleton className="h-52 w-full bg-white/80" />
    </div>
  );
}

function isActive(user) {
  return user.active ?? user.enabled ?? user.status !== "INACTIVE";
}

function formatRole(role) {
  return String(role || "-").replaceAll("_", " ");
}

function formatDate(value) {
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
