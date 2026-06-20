import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Gavel, IndianRupee, Trophy } from "lucide-react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import PageShell, { PageHero, StatePanel } from "../components/layout/PageShell";
import Skeleton from "../components/ui/Skeleton";
import useGroupMeta from "../hooks/useGroupMeta";

export default function Auction() {
  const { groupId } = useParams();
  const groupMeta = useGroupMeta();

  const [members, setMembers] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [winner, setWinner] = useState("");
  const [month, setMonth] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [auctionHistory, setAuctionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const memberMap = useMemo(() => {
    return Object.fromEntries(allMembers.map((member) => [member.id, member]));
  }, [allMembers]);

  const wonMemberIds = useMemo(() => {
    return new Set(auctionHistory.map((auction) => auction.winnerMemberId));
  }, [auctionHistory]);

  const applyAuctionData = (groupMembersData, memberData, historyData) => {
    setMembers(Array.isArray(groupMembersData) ? groupMembersData : []);
    setAllMembers(Array.isArray(memberData) ? memberData : []);
    setAuctionHistory(Array.isArray(historyData) ? historyData : []);
    setError("");
  };

  const loadAuction = async ({ showLoading = true } = {}) => {
    if (!groupId) {
      setLoading(false);
      setError("Select a group before opening auctions.");
      return;
    }

    try {
      if (showLoading) setLoading(true);
      setError("");

      const [groupMemberRes, memberRes, auctionRes] = await Promise.all([
        api.get(`/group-members/${groupId}`),
        api.get("/members"),
        api.get(`/auction/${groupId}`),
      ]);

      applyAuctionData(groupMemberRes.data, memberRes.data, auctionRes.data);
    } catch (err) {
      console.error("Error loading auction", err);
      setError("Could not load auction data. Please try again.");
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
      api.get(`/auction/${groupId}`),
    ])
      .then(([groupMemberRes, memberRes, auctionRes]) => {
        if (!active) return;
        applyAuctionData(groupMemberRes.data, memberRes.data, auctionRes.data);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Error loading auction", err);
        setError("Could not load auction data. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [groupId]);

  const handleAuction = async () => {
    if (!winner || !month || !bidAmount) {
      alert("Fill all fields");
      return;
    }

    try {
      setSaving(true);
      await api.post("/auction", null, {
        params: {
          groupId,
          month: Number(month),
          winnerId: Number(winner),
          bidAmount: Number(bidAmount),
        },
      });

      setWinner("");
      setMonth("");
      setBidAmount("");
      await loadAuction({ showLoading: false });
      alert("Auction completed");
    } catch (err) {
      console.error("Error completing auction", err);
      alert(err.response?.data || "Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell title="Auction" subtitle={groupMeta.subtitle}>
      <PageHero
        eyebrow="Monthly auction"
        title="Auction"
        description="Pick a month, select an eligible winner, and record bid details for the selected group."
        icon={<Gavel size={22} />}
      />

      {!groupId && (
        <StatePanel
          icon={<Gavel size={22} />}
          title="No group selected"
          message="Open a group first, then use the auction tab for that group."
        />
      )}

      {groupId && loading && <AuctionSkeleton />}

      {groupId && !loading && error && (
        <StatePanel
          icon={<AlertCircle size={22} />}
          title="Unable to load auction"
          message={error}
          actionLabel="Retry"
          onAction={loadAuction}
        />
      )}

      {groupId && !loading && !error && (
        <>
          <section className="rounded-lg border border-white/20 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Gavel size={18} className="text-orange-600" />
              <h2 className="text-sm font-semibold text-slate-950">
                Record Auction
              </h2>
            </div>

            <div className="space-y-3">
              <Field label="Month">
                <input
                  type="number"
                  value={month}
                  className="field-input"
                  placeholder="Enter month"
                  onChange={(e) => setMonth(e.target.value)}
                />
              </Field>

              <Field label="Winner">
                <select
                  value={winner}
                  className="field-input"
                  onChange={(e) => setWinner(e.target.value)}
                >
                  <option value="">Select winner</option>
                  {members.map((member) => {
                    const alreadyWon = wonMemberIds.has(member.memberId);
                    const profile = memberMap[member.memberId];

                    return (
                      <option
                        key={member.memberId}
                        value={member.memberId}
                        disabled={alreadyWon}
                      >
                        {profile?.name || `Member ${member.memberId}`}
                        {alreadyWon ? " (Won)" : ""}
                      </option>
                    );
                  })}
                </select>
              </Field>

              <Field label="Bid Amount">
                <div className="relative">
                  <IndianRupee
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="number"
                    value={bidAmount}
                    className="field-input pl-9"
                    placeholder="Enter bid amount"
                    onChange={(e) => setBidAmount(e.target.value)}
                  />
                </div>
              </Field>
            </div>

            <button
              type="button"
              onClick={handleAuction}
              disabled={saving || members.length === 0}
              className="mt-5 w-full rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {saving ? "Confirming..." : "Confirm Auction"}
            </button>
          </section>

          <section className="mt-5">
            <div className="mb-3 flex items-center gap-2 text-white">
              <Trophy size={18} />
              <h2 className="text-sm font-semibold">Auction History</h2>
            </div>

            {auctionHistory.length === 0 ? (
              <StatePanel
                icon={<Trophy size={22} />}
                title="No auctions yet"
                message="Completed auctions will appear here for this group."
              />
            ) : (
              <div className="space-y-3">
                {auctionHistory.map((auction) => (
                  <AuctionHistoryCard
                    key={auction.id}
                    auction={auction}
                    member={memberMap[auction.winnerMemberId]}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </PageShell>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function AuctionHistoryCard({ auction, member }) {
  return (
    <div className="rounded-lg border border-white/20 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Month {auction.month}
          </p>
          <h3 className="mt-1 text-base font-semibold text-slate-950">
            {member?.name || `Member ${auction.winnerMemberId}`}
          </h3>
        </div>
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-right">
          <p className="text-xs text-emerald-600">Profit</p>
          <p className="font-semibold text-emerald-800">
            {formatCurrency(auction.profit)}
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-400">Payout</p>
          <p className="font-semibold text-slate-950">
            {formatCurrency(auction.payoutAmount)}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-400">Winner ID</p>
          <p className="font-semibold text-slate-950">
            {auction.winnerMemberId}
          </p>
        </div>
      </div>
    </div>
  );
}

function AuctionSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-72 w-full bg-white/80" />
      <Skeleton className="h-20 w-full bg-white/80" />
      <Skeleton className="h-20 w-full bg-white/80" />
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
