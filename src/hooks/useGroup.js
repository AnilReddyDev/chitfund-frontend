import { useParams } from "react-router-dom";
import { useEffect } from "react";

export default function useGroup() {
  const { groupId } = useParams();

  // persist groupId
  useEffect(() => {
    if (groupId) {
      localStorage.setItem("groupId", groupId);
    }
  }, [groupId]);

  // fallback
  const stored = localStorage.getItem("groupId");

  return groupId || stored;
}