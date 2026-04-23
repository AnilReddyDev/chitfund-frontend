// src/pages/GroupMemberHistory.jsx

import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

import AssignMemberModal from "../components/group/AssignMemberModal";

export default function GroupMemberHistory() {
  const { groupId } = useParams();

  const [members, setMembers] = useState([]);        // [memberId, memberId]
  const [allMembers, setAllMembers] = useState([]);  // full member objects
  const [open, setOpen] = useState(false);

  // 📡 Fetch data
  const fetchMembers = async () => {
    if (!groupId) return;

    try {
      const [gmRes, memberRes] = await Promise.all([
        api.get(`/group-members/${groupId}`),
        api.get("/members"),
      ]);

      // store IDs only
      const memberIds = (gmRes.data || []).map((m) => m.memberId);

      setMembers(memberIds);
      setAllMembers(memberRes.data || []);

    } catch (err) {
      console.error("Error fetching members", err);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [groupId]);

  // 🔥 FAST LOOKUP MAP (no repeated find)
  const memberMap = useMemo(() => {
    return Object.fromEntries(
      allMembers.map((m) => [m.id, m])
    );
  }, [allMembers]);

  return (
    <div className="p-4">

      <h1 className="text-lg font-semibold mb-3">
        Group Members ({members.length})
      </h1>

      {/* Member List */}
      {members.map((id) => {
        const member = memberMap[id];

        return (
          <div
            key={id}
            className="bg-white p-4 rounded-xl shadow mb-3"
          >
            <h2 className="font-semibold">
              {member?.name || "Unknown"}
            </h2>
            <p className="text-xs text-gray-400">
              {member?.phone || ""}
            </p>
          </div>
        );
      })}

      {/* Add Member Button */}
      <button
        onClick={() => setOpen(true)}
        className="bg-black text-white px-4 py-2 rounded mt-4 w-full"
      >
        Add Member
      </button>

      {/* Modal */}
      {open && (
        <AssignMemberModal
          groupId={groupId}
          existingMembers={members} // ✅ IDs array
          onClose={() => {
            setOpen(false);
            fetchMembers(); // refresh
          }}
        />
      )}
    </div>
  );
}