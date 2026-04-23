// src/pages/Ledger.jsx

import { useEffect, useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import api from "../services/api";
import Header from "../components/layout/Header";
import PaymentModal from "../components/ledger/PaymentModal";
import LedgerExport from "../components/ledger/LedgerExport";
export default function Ledger() {
  const { groupId } = useContext(AppContext);

  const [members, setMembers] = useState([]);
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 For modal control
  const [selectedCell, setSelectedCell] = useState(null);

  // 📡 Fetch ledger data
  useEffect(() => {
    console.log("Ledger useEffect");
    if (!groupId) return;
  })


useEffect(() => {
  console.log("Fetching ledger", groupId);
  if (!groupId) return;
  console.log("crossed groupId", groupId);

  const loadLedger = async () => {
    try {
      setLoading(true);

      const res = await api.get("/ledger/full", {
        params: { groupId },
      });

      setMembers(res.data.members || []);
      setMonths(res.data.months || []);
    } catch (err) {
      console.error("Ledger fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  loadLedger();
}, [groupId]);

  // 🖱️ Handle cell click
  const handleCellClick = (memberId, month) => {
    setSelectedCell({ memberId, month });
  };

  return (
    <div className="flex flex-col h-screen">
      <Header title="Ledger" />

      <div className="p-2 overflow-auto flex-1">
        {/* Loading */}
        {loading && (
          <p className="text-center text-gray-400">Loading...</p>
        )}

        {/* Empty State */}
        {!loading && members.length === 0 && (
          <p className="text-center text-gray-400">
            No members found
          </p>
        )}

        {/* Ledger Table */}
        {!loading && members.length > 0 && (
          <div className="overflow-auto">
            <table className="min-w-full text-xs border border-gray-200">
              
              {/* Header */}
              <thead className="sticky top-0 bg-white z-10">
                <tr>
                  <th className="border p-2 bg-gray-100 text-left">
                    Member
                  </th>

                  {months.map((m, i) => (
                    <th
                      key={i}
                      className="border p-2 bg-gray-100 text-center"
                    >
                      {formatMonth(m)}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {members.map((member) => (
                  <tr key={member.memberId}>
                    
                    {/* Member Name */}
                    <td className="border p-2 font-medium whitespace-nowrap">
                      {member.name}
                    </td>

                    {/* Payments */}
                    {member.payments.map((p, i) => (
                      <td
                        key={i}
                        className={`border text-center cursor-pointer h-10 ${
                          p.paid
                            ? "bg-green-100 text-green-700"
                            : "bg-white"
                        }`}
                        onClick={() =>
                          handleCellClick(member.memberId, p.month)
                        }
                      >
                        {p.paid ? "✔" : ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 💰 Payment Modal */}
      {selectedCell && (
        <PaymentModal
          memberId={selectedCell.memberId}
          month={selectedCell.month}
          groupId={groupId}
          onClose={() => setSelectedCell(null)}
          onSuccess={() => window.location.reload()}
        />
      )}

      <div >
        {groupId && (
          <LedgerExport groupId={groupId} />
        )}
      </div>
    </div>
  );

}

/* 📅 Helper: Format Month */
function formatMonth(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
  });
}