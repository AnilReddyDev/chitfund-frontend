import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Gavel,
  IndianRupee,
  Phone,
  ReceiptText,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import PageShell, { PageHero, StatePanel } from "../components/layout/PageShell";
import Skeleton from "../components/ui/Skeleton";
import useGroupMeta, {
  formatGroupDate,
  resolveGroupCreatedAt,
} from "../hooks/useGroupMeta";

const EMPTY_OBJECT = {};

export default function Dashboard() {
  const { groupId } = useParams();
  const groupMeta = useGroupMeta();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  const applyDashboard = (summaryData) => {
    setSummary(summaryData || null);
    setError("");

    setSelectedMonth((currentMonth) => {
      const resolvedMonth = resolveDashboardMonth(summaryData);
      const duration = Number(summaryData?.group?.duration || 0);

      if (!currentMonth) return resolvedMonth;
      if (duration > 0 && currentMonth > duration) return duration;
      return currentMonth;
    });
  };

  const loadDashboard = async ({ showLoading = true } = {}) => {
    if (!groupId) {
      setLoading(false);
      setError("Select a group before opening the dashboard.");
      return;
    }

    try {
      if (showLoading) setLoading(true);
      setError("");
      const params = selectedMonth
        ? { groupId, month: selectedMonth }
        : { groupId };

      const summaryRes = await api.get("/dashboard/summary", { params });

      applyDashboard(summaryRes.data);
    } catch (err) {
      console.error("Error loading dashboard", err);
      setError("Could not load dashboard data. Please try again.");
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
      .get("/dashboard/summary", {
        params: selectedMonth ? { groupId, month: selectedMonth } : { groupId },
      })
      .then((summaryRes) => {
        if (!active) return;
        applyDashboard(summaryRes.data);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Error loading dashboard", err);
        setError("Could not load dashboard data. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [groupId, selectedMonth]);

  const group = summary?.group ?? EMPTY_OBJECT;
  const collection = summary?.collection ?? EMPTY_OBJECT;
  const payments = summary?.payments ?? EMPTY_OBJECT;
  const auction = summary?.auction ?? EMPTY_OBJECT;
  const profit = summary?.profit ?? EMPTY_OBJECT;
  const health = summary?.health ?? EMPTY_OBJECT;
  const resolvedMonth = selectedMonth || resolveDashboardMonth(summary);
  const displayGroup = useMemo(
    () => ({
      ...groupMeta.group,
      ...group,
      currentMonth: resolvedMonth,
    }),
    [group, groupMeta.group, resolvedMonth],
  );
  const displayCollection = useMemo(
    () => collection,
    [collection],
  );
  const displayAuction = useMemo(
    () => resolveAuctionForMonth(auction, resolvedMonth),
    [auction, resolvedMonth],
  );

  const attentionItems = useMemo(() => {
    if (!summary) return [];

    const payments = summary.payments || {};
    const pendingCount = payments.pendingMembers?.length || 0;
    const overdueCount = payments.overdueMembers?.length || 0;
    const assignedMembers = Number(displayGroup.assignedMembers || 0);
    const totalMembers = Number(displayGroup.totalMembers || 0);
    const items = [];

    if (pendingCount > 0) {
      items.push({
        label: `${pendingCount} members pending payment`,
        detail: "Collect this month's premium",
        to: `/group/${groupId}/ledger`,
        tone: "amber",
      });
    }

    if (overdueCount > 0) {
      items.push({
        label: `${overdueCount} members overdue`,
        detail: "Review missed previous months",
        to: `/group/${groupId}/ledger`,
        tone: "red",
      });
    }

    if (displayAuction.currentMonthAuctionStatus === "PENDING") {
      items.push({
        label: `Month ${resolvedMonth || "-"} auction pending`,
        detail: "Complete auction for the selected month",
        to: `/group/${groupId}/auction`,
        tone: "amber",
      });
    }

    if (totalMembers > 0 && assignedMembers < totalMembers) {
      items.push({
        label: `${assignedMembers}/${totalMembers} members assigned`,
        detail: "Fill remaining member slots",
        to: `/group/${groupId}/members`,
        tone: "slate",
      });
    }

    if (items.length === 0) {
      items.push({
        label: "Everything looks up to date",
        detail: "No immediate admin action needed",
        to: `/group/${groupId}/ledger`,
        tone: "green",
      });
    }

    return items;
  }, [displayAuction, displayGroup, groupId, resolvedMonth, summary]);

  const canMovePrevious = Number(resolvedMonth || 0) > 1;
  const canMoveNext =
    Number(displayGroup.duration || 0) === 0 ||
    Number(resolvedMonth || 0) < Number(displayGroup.duration || 0);
  const moveMonth = (direction) => {
    setSelectedMonth((currentMonth) => {
      const baseMonth = Number(currentMonth || resolvedMonth || 1);
      const duration = Number(displayGroup.duration || 0);
      const nextMonth = baseMonth + direction;

      if (nextMonth < 1) return 1;
      if (duration > 0 && nextMonth > duration) return duration;
      return nextMonth;
    });
  };

  const createdLabel =
    formatGroupDate(resolveGroupCreatedAt(displayGroup)) ||
    groupMeta.createdLabel;
  const pageSubtitle = groupId
    ? [
        displayGroup.name || groupMeta.displayName,
        createdLabel ? `Created ${createdLabel}` : "",
      ]
        .filter(Boolean)
        .join(" • ")
    : "No group selected";

  return (
    <PageShell
      title="Dashboard"
      subtitle={pageSubtitle}
    >
      <PageHero
        eyebrow="Group command center"
        title={displayGroup.name || "Dashboard"}
        description="Track monthly collection, risks, auctions, member dues, and profit from one operational view."
        icon={<BarChart3 size={22} />}
      />

      {!groupId && (
        <StatePanel
          icon={<BarChart3 size={22} />}
          title="No group selected"
          message="Open a group first, then use the dashboard tab for that group."
        />
      )}

      {groupId && loading && <DashboardSkeleton />}

      {groupId && !loading && error && (
        <StatePanel
          icon={<AlertCircle size={22} />}
          title="Unable to load dashboard"
          message={error}
          actionLabel="Retry"
          onAction={loadDashboard}
        />
      )}

      {groupId && !loading && !error && summary && (
        <div className="space-y-4">
          <MonthNavigator
            month={resolvedMonth}
            duration={displayGroup.duration}
            onPrevious={() => moveMonth(-1)}
            onNext={() => moveMonth(1)}
            canMovePrevious={canMovePrevious}
            canMoveNext={canMoveNext}
          />

          <MonthlySummary group={displayGroup} collection={displayCollection} />

          <NeedsAttention items={attentionItems} />

          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              icon={<IndianRupee size={18} />}
              title="Total Collected"
              value={formatCurrency(collection.totalCollectedTillNow)}
            />
            <MetricCard
              icon={<TrendingUp size={18} />}
              title="Total Profit"
              value={formatCurrency(profit.totalProfit)}
            />
            <MetricCard
              icon={<Users size={18} />}
              title="Members"
              value={`${displayGroup.assignedMembers || 0}/${displayGroup.totalMembers || 0}`}
            />
            <MetricCard
              icon={<Gavel size={18} />}
              title="Eligible Auctions"
              value={displayAuction.nextAuction?.eligibleMembers ?? 0}
            />
          </div>

          <HealthCard health={health} />

          <AuctionSnapshot auction={displayAuction} group={displayGroup} />

          <MonthBreakdown
            group={displayGroup}
            collection={displayCollection}
            payments={payments}
            auction={displayAuction}
            profit={profit}
          />

          <MemberDueSection
            title={`Pending Month ${resolvedMonth || "-"}`}
            emptyText="No pending payments for the selected month."
            members={payments.pendingMembers || []}
            variant="pending"
          />

          <MemberDueSection
            title="Overdue Members"
            emptyText="No overdue payments from previous months."
            members={payments.overdueMembers || []}
            variant="overdue"
          />

          <QuickActions groupId={groupId} />
        </div>
      )}
    </PageShell>
  );
}

function MonthlySummary({ group, collection }) {
  const rate = clampPercent(collection.collectionRate);
  const month = group.currentMonth || 0;
  const duration = group.duration || 0;

  return (
    <section className="rounded-lg border border-white/20 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Current Month
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">
            Month {month || "-"} {duration ? `of ${duration}` : ""}
          </h2>
        </div>
        <div className={statusPill(rate)}>
          {rate}% complete
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-medium text-slate-600">
            {formatCurrency(collection.collectedThisMonth)} collected
          </span>
          <span className="text-slate-400">
            {formatCurrency(collection.expectedThisMonth)} expected
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${rate}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MiniStat title="Pending" value={formatCurrency(collection.pendingThisMonth)} />
        <MiniStat title="Premium" value={formatCurrency(group.monthlyPremium)} />
      </div>
    </section>
  );
}

function MonthNavigator({
  month,
  duration,
  onPrevious,
  onNext,
  canMovePrevious,
  canMoveNext,
}) {
  return (
    <section className="rounded-lg border border-white/20 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          aria-label="Previous month"
          onClick={onPrevious}
          disabled={!canMovePrevious}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
        >
          <ChevronLeft size={22} />
        </button>

        <div className="min-w-0 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Viewing Month
          </p>
          <h2 className="mt-0.5 text-lg font-semibold text-slate-950">
            Month {month || "-"} {duration ? `of ${duration}` : ""}
          </h2>
        </div>

        <button
          type="button"
          aria-label="Next month"
          onClick={onNext}
          disabled={!canMoveNext}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </section>
  );
}

function NeedsAttention({ items }) {
  return (
    <section className="rounded-lg border border-white/20 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Action required
          </p>
          <h2 className="mt-1 text-base font-semibold text-slate-950">
            Needs Attention
          </h2>
        </div>
        <CalendarClock size={20} className="text-orange-600" />
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <Link
            key={`${item.label}-${item.to}`}
            to={item.to}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3 transition active:scale-[0.99]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className={attentionDot(item.tone)} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">
                  {item.label}
                </p>
                <p className="truncate text-xs text-slate-400">{item.detail}</p>
              </div>
            </div>
            <ArrowRight size={17} className="shrink-0 text-slate-400" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function HealthCard({ health }) {
  const status = health.status || "UNKNOWN";
  const score = Number(health.score || 0);
  const reasons = Array.isArray(health.reasons) ? health.reasons : [];

  return (
    <section className="rounded-lg border border-white/20 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Group Health
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            {humanizeStatus(status)}
          </h2>
        </div>
        <div className={healthBadge(status)}>
          <BadgeCheck size={16} />
          {score}/100
        </div>
      </div>

      {reasons.length > 0 && (
        <div className="mt-4 space-y-2">
          {reasons.map((reason) => (
            <div
              key={reason}
              className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600"
            >
              {reason}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function AuctionSnapshot({ auction, group }) {
  const lastAuction = auction.lastAuction;
  const currentStatus = auction.currentMonthAuctionStatus || "PENDING";

  return (
    <section className="rounded-lg border border-white/20 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Auction
          </p>
          <h2 className="mt-1 text-base font-semibold text-slate-950">
            Month {group.currentMonth || "-"} is {humanizeStatus(currentStatus)}
          </h2>
        </div>
        <Gavel size={20} className="text-orange-600" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-400">Last Winner</p>
          <p className="mt-1 truncate font-semibold text-slate-950">
            {lastAuction?.winnerName || "No auction yet"}
          </p>
          {lastAuction && (
            <p className="mt-1 text-xs text-slate-400">
              Month {lastAuction.month}
            </p>
          )}
        </div>
        <div className="rounded-lg bg-emerald-50 p-3">
          <p className="text-xs text-emerald-600">Last Profit</p>
          <p className="mt-1 font-semibold text-emerald-800">
            {formatCurrency(lastAuction?.profit)}
          </p>
          <p className="mt-1 text-xs text-emerald-600">
            Bid {formatCurrency(lastAuction?.bidAmount)}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-400">Payout</p>
          <p className="mt-1 font-semibold text-slate-950">
            {formatCurrency(lastAuction?.payoutAmount)}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-400">Eligible Members</p>
          <p className="mt-1 font-semibold text-slate-950">
            {auction.nextAuction?.eligibleMembers ?? 0}
          </p>
        </div>
      </div>
    </section>
  );
}

function MemberDueSection({ title, emptyText, members, variant }) {
  return (
    <section className="rounded-lg border border-white/20 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {members.length}
        </span>
      </div>

      {members.length === 0 ? (
        <p className="rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-400">
          {emptyText}
        </p>
      ) : (
        <div className="space-y-2">
          {members.slice(0, 5).map((member) => (
            <div
              key={`${variant}-${member.memberId}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">
                  {member.name || `Member ${member.memberId}`}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                  <Phone size={13} />
                  {member.phone || "No phone"}
                </p>
                {variant === "overdue" && (
                  <p className="mt-1 text-xs text-red-500">
                    Missed months: {(member.missedMonths || []).join(", ") || "-"}
                  </p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-slate-950">
                  {formatCurrency(member.amountDue)}
                </p>
                <p className="text-xs text-slate-400">
                  {variant === "pending" ? `Month ${member.month}` : "Due"}
                </p>
              </div>
            </div>
          ))}

          {members.length > 5 && (
            <p className="pt-1 text-center text-xs text-slate-400">
              +{members.length - 5} more members
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function MonthBreakdown({ group, collection, payments, auction, profit }) {
  const assignedMembers = Number(group.assignedMembers || 0);
  const totalMembers = Number(group.totalMembers || 0);
  const pendingMembers = payments.pendingMembers || [];
  const overdueMembers = payments.overdueMembers || [];
  const expected = Number(collection.expectedThisMonth || 0);
  const collected = Number(collection.collectedThisMonth || 0);
  const pending = Number(collection.pendingThisMonth || 0);
  const averageProfit = Number(profit.averageProfitPerAuction || 0);
  const memberFillRate = totalMembers > 0
    ? Math.round((assignedMembers / totalMembers) * 100)
    : 0;

  return (
    <section className="rounded-lg border border-white/20 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Month Breakdown
          </p>
          <h2 className="mt-1 text-base font-semibold text-slate-950">
            What this month means
          </h2>
        </div>
        <ClipboardList size={20} className="text-orange-600" />
      </div>

      <div className="space-y-3">
        <BreakdownRow
          label="Collection gap"
          value={formatCurrency(pending)}
          helper={`${formatCurrency(collected)} received from ${formatCurrency(expected)} expected`}
          tone={pending > 0 ? "amber" : "green"}
        />
        <BreakdownRow
          label="Payment follow-up"
          value={`${pendingMembers.length} pending`}
          helper={`${overdueMembers.length} members have previous dues`}
          tone={pendingMembers.length > 0 || overdueMembers.length > 0 ? "red" : "green"}
        />
        <BreakdownRow
          label="Auction status"
          value={humanizeStatus(auction.currentMonthAuctionStatus)}
          helper={`${auction.nextAuction?.eligibleMembers ?? 0} eligible members left`}
          tone={auction.currentMonthAuctionStatus === "COMPLETED" ? "green" : "amber"}
        />
        <BreakdownRow
          label="Member fill"
          value={`${assignedMembers}/${totalMembers || "-"}`}
          helper={`${memberFillRate}% of planned members assigned`}
          tone={totalMembers > 0 && assignedMembers < totalMembers ? "amber" : "green"}
        />
        <BreakdownRow
          label="Average auction profit"
          value={formatCurrency(averageProfit)}
          helper="Average profit from completed auctions"
          tone="slate"
        />
      </div>
    </section>
  );
}

function BreakdownRow({ label, value, helper, tone }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className={attentionDot(tone)} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950">
            {label}
          </p>
          <p className="truncate text-xs text-slate-400">{helper}</p>
        </div>
      </div>
      <p className="shrink-0 text-right text-sm font-semibold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function QuickActions({ groupId }) {
  const actions = [
    {
      label: "Open Ledger",
      helper: "Collect or verify payments",
      icon: <ReceiptText size={18} />,
      to: `/group/${groupId}/ledger`,
    },
    {
      label: "Run Auction",
      helper: "Complete selected month auction",
      icon: <Gavel size={18} />,
      to: `/group/${groupId}/auction`,
    },
    {
      label: "Manage Members",
      helper: "Assign missing group members",
      icon: <Users size={18} />,
      to: `/group/${groupId}/members`,
    },
  ];

  return (
    <section className="rounded-lg border border-white/20 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Shortcuts
        </p>
        <h2 className="mt-1 text-base font-semibold text-slate-950">
          Quick Actions
        </h2>
      </div>

      <div className="grid gap-2">
        {actions.map((action) => (
          <Link
            key={action.label}
            to={action.to}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3 transition active:scale-[0.99]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-700">
                {action.icon}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">
                  {action.label}
                </p>
                <p className="truncate text-xs text-slate-400">
                  {action.helper}
                </p>
              </div>
            </div>
            <ArrowRight size={17} className="shrink-0 text-slate-400" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function MetricCard({ icon, title, value }) {
  return (
    <div className="rounded-lg border border-white/20 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <p className="text-xs font-medium uppercase tracking-wide">{title}</p>
      </div>
      <h2 className="mt-2 truncate text-lg font-semibold text-slate-950">
        {value}
      </h2>
    </div>
  );
}

function MiniStat({ title, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs text-slate-400">{title}</p>
      <p className="mt-1 truncate text-sm font-semibold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-56 w-full bg-white/80" />
      <Skeleton className="h-44 w-full bg-white/80" />
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((item) => (
          <Skeleton key={item} className="h-24 w-full bg-white/80" />
        ))}
      </div>
      <Skeleton className="h-64 w-full bg-white/80" />
      <Skeleton className="h-64 w-full bg-white/80" />
    </div>
  );
}

function formatCurrency(value) {
  const numberValue = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numberValue) ? numberValue : 0);
}

function clampPercent(value) {
  const numberValue = Number(value || 0);
  if (!Number.isFinite(numberValue)) return 0;
  return Math.min(100, Math.max(0, numberValue));
}

function resolveDashboardMonth(summary) {
  const groupMonth = Number(summary?.group?.currentMonth || 0);
  const lastAuctionMonth = Number(summary?.auction?.lastAuction?.month || 0);
  const nextAuctionMonth = Number(summary?.auction?.nextAuction?.month || 0);
  const duration = Number(summary?.group?.duration || 0);
  const resolvedMonth = Math.max(
    1,
    groupMonth,
    lastAuctionMonth,
    nextAuctionMonth,
  );

  if (duration > 0) return Math.min(resolvedMonth, duration);
  return resolvedMonth;
}

function resolveAuctionForMonth(auction, month) {
  const lastAuctionMonth = Number(auction?.lastAuction?.month || 0);
  const selectedMonth = Number(month || 0);
  const currentMonthAuctionStatus =
    selectedMonth > 0 && lastAuctionMonth >= selectedMonth
      ? "COMPLETED"
      : auction?.currentMonthAuctionStatus || "PENDING";

  return {
    ...auction,
    currentMonthAuctionStatus,
    nextAuction: {
      ...auction?.nextAuction,
      month: selectedMonth || auction?.nextAuction?.month,
    },
  };
}

function humanizeStatus(value) {
  return String(value || "Unknown")
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusPill(rate) {
  if (rate >= 80) {
    return "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700";
  }

  if (rate >= 50) {
    return "rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700";
  }

  return "rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700";
}

function healthBadge(status) {
  if (status === "GOOD") {
    return "inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700";
  }

  if (status === "NEEDS_ATTENTION") {
    return "inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700";
  }

  return "inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700";
}

function attentionDot(tone) {
  const tones = {
    amber: "bg-amber-400",
    red: "bg-red-500",
    green: "bg-emerald-500",
    slate: "bg-slate-400",
  };

  return `h-2.5 w-2.5 shrink-0 rounded-full ${tones[tone] || tones.slate}`;
}
