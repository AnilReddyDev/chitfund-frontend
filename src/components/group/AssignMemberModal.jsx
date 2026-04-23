// src/components/group/AssignMemberModal.jsx

import { useEffect, useState } from "react";
import api from "../../services/api";
import Card from "../ui/Card";
import Button from "../ui/Button";

export default function AssignMemberModal({
  groupId,
  existingMembers, // [id, id]
  onClose,
}) {
  const [members, setMembers] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  // 📡 Fetch all members
  useEffect(() => {
    api.get("/members").then((res) => {
      setMembers(res.data || []);
    });
  }, []);

  // ✅ FIXED: already IDs
  const existingIds = new Set(existingMembers || []);

  // ➕ Assign member
  const assign = async (memberId) => {
    try {
      setLoadingId(memberId);

      await api.post("/group-members", {
        groupId,
        memberId,
      });

      // 🔥 instant UX improvement
      onClose();

    } catch (err) {
      alert("Already added or error");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0  flex items-end">
      <Card className="w-full max-h-[80%] overflow-auto p-4">

        <h2 className="font-semibold mb-3 text-lg">
          Select Members
        </h2>

        {members.map((m) => {
          const isAdded = existingIds.has(m.id);

          return (
            <div
              key={m.id}
              className="flex justify-between items-center mb-3"
            >
              <div>
                <p className="font-medium">{m.name}</p>
                <p className="text-xs text-gray-400">
                  {m.phone}
                </p>
              </div>

              <Button
                onClick={() => assign(m.id)}
                disabled={isAdded || loadingId === m.id}
              >
                {isAdded
                  ? "Added"
                  : loadingId === m.id
                  ? "Adding..."
                  : "Add"}
              </Button>
            </div>
          );
        })}

        {/* Close */}
        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-500 w-full"
        >
          Close
        </button>

      </Card>
    </div>
  );
}