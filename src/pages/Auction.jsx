import {  useEffect, useState } from "react";
import api from "../services/api";
import Header from "../components/layout/Header";
import useGroup from "../hooks/useGroup";

export default function Auction() {

  const groupId = useGroup();

  const [members, setMembers] = useState([]);
  const [winner, setWinner] = useState("");
  const [month, setMonth] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [auctionHistory, setAuctionHistory] = useState([]);

  useEffect(() => {
    console.log("Fetching members", groupId);
    if (!groupId) return;

    // fetch members
    api
      .get(`/group-members/${groupId}`)
      .then((res) => setMembers(res.data))
      .catch((err) => console.error(err));

    // fetch history
    api.get(`/auction/${groupId}`).then((res) => setAuctionHistory(res.data));
  }, [groupId]);

  const handleAuction = async () => {
    if (!winner || !month || !bidAmount) {
      alert("Fill all fields");
      return;
    }

    try {
      await api.post("/auction", null, {
        params: {
          groupId,
          month: Number(month),
          winnerId: Number(winner),
          bidAmount: Number(bidAmount),
        },
      });

      alert("Auction completed ✅");
    } catch (err) {
      console.error(err);
      alert(err.response?.data || "Error");
    }
  };

  return (
    <div className="min-h-screen mb-10 bg-gradient-to-b from-orange-600 to-orange-500">
      <Header title="Auction" />

      {/* Auction Form */}
      <div className="p-4 space-y-4 bg-slate-50 m-3 rounded-md shadow-[#ffffff1a_0px_1px_1px_0px_inset,#32325d40_0px_50px_100px_-20px,#0000004d_0px_30px_60px_-30px]">
        {/* Month Input */}
        <div>
          <label className="text-sm text-gray-500">Month</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            placeholder="Enter month (1,2,3...)"
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>

        {/* Winner Selection */}
        <div>
          <label className="text-sm text-gray-500">Select Winner</label>
          <select
            className="w-full p-2 border rounded"
            onChange={(e) => setWinner(e.target.value)}
          >
            <option value="">Select Winner</option>

            {members.map((m) => {
              const alreadyWon = auctionHistory.some(
                (a) => a.winnerMemberId === m.memberId,
              );

              return (
                <option
                  key={m.memberId}
                  value={m.memberId}
                  disabled={alreadyWon}
                >
                  Member {m.memberId} {alreadyWon ? "(Won)" : ""}
                </option>
              );
            })}
          </select>
        </div>

        {/* Bid Amount */}
        <div>
          <label className="text-sm text-gray-500">Bid Amount</label>
          <input
            type="number"
            className="w-full p-2 border rounded "
            placeholder="Enter bid amount"
            onChange={(e) => setBidAmount(e.target.value)}
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleAuction}
          className="w-full bg-green-500 text-black p-2 rounded"
        >
          Confirm Auction
        </button>
      </div>

      {/* Auction History */}
      <div className="mt-6">
        <h3 className="font-semibold m-3">Auction History</h3>

        {auctionHistory.length === 0 && (
          <p className="text-gray-400 text-sm">No auctions yet</p>
        )}

        {auctionHistory.map((a) => (
          <div key={a.id} className="border p-3 rounded  bg-slate-100 shadow-[#ffffff1a_0px_1px_1px_0px_inset,#32325d40_0px_50px_100px_-20px,#0000004d_0px_30px_60px_-30px] m-3">
            <p className="text-sm">Month: {a.month}</p>
            <p className="text-sm">Winner: {a.winnerMemberId}</p>
            <p className="text-sm">Payout: ₹{a.payoutAmount}</p>
            <p className="text-sm text-green-600">Profit: ₹{a.profit}</p>
          </div>
        ))}
        <div className="h-5 w-full"> </div>
      </div>
    </div>
  );
}
