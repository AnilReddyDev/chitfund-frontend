// src/pages/Ledger.jsx
import { useEffect, useState } from "react";
import api from "../services/api";
import useGroup from "../hooks/useGroup.js";
import Header from "../components/layout/Header";
import PaymentModal from "../components/ledger/PaymentModal";
import LedgerExport from "../components/ledger/LedgerExport";


export default function Ledger() {
  const groupId = useGroup();

  const [members, setMembers] = useState([]);
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);

  const loadLedger = async () => {
    if (!groupId) return;

    try {
      setLoading(true);
      const res = await api.get("/ledger/full", {
        params: { groupId },
      });

      setMembers(res.data.members || []);
      setMonths(res.data.months || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, [groupId]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-orange-600 to-orange-400">
      <Header title="Ledger" />

      <div className="p-3 flex-1 overflow-auto">
        {loading && <p className="text-center text-gray-400">Loading...</p>}

        {!loading && members.length === 0 && (
          <p className="text-center text-gray-400">No members</p>
        )}

        {!loading && members.length > 0 && (
          <table className="w-full bg-slate-100 p-2 text-xs  rounded-xl overflow-hidden opacity-90">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="p-2 text-left border-2 border-red-100 ">Member</th>
                {months.map((m, i) => (
                  <th key={i} className="p-2 text-center border-2 border-red-100  ">
                    {formatMonth(m)}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {members.map((member) => (
                <tr key={member.memberId}>
                  <td className="p-2 font-medium border-2 border-red-100 p-2  ">{member.name}</td>

                  {member.payments.map((p, i) => (
                    <td

                      key={i}
                      onClick={() =>
                        setSelectedCell({
                          memberId: member.memberId,
                          month: p.month,
                        })
                      }
                      className={`text-center cursor-pointer border-2 border-red-100 p-2 ${
                        p.paid
                          ? "bg-green-100 text-green-700"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {p.paid ? "✔" : ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
         <div className="p-3">
        <LedgerExport />
      </div>
      </div>

      {selectedCell && (
        <PaymentModal
          memberId={selectedCell.memberId}
          month={selectedCell.month}
          groupId={groupId}
          onClose={() => setSelectedCell(null)}
          onSuccess={loadLedger} // ✅ no reload
        />
      )}

     
    </div>
  );
}

function formatMonth(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
  });
}