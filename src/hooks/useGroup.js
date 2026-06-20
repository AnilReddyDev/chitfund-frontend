import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";

export default function useGroup() {
  const { groupId } = useParams();
  const { pathname } = useLocation();
  const pathGroupId = pathname.match(/^\/group\/([^/]+)/)?.[1];
  const activeGroupId = groupId || pathGroupId;

  useEffect(() => {
    if (activeGroupId) {
      localStorage.setItem("groupId", activeGroupId);
    }
  }, [activeGroupId]);

  const stored = localStorage.getItem("groupId");

  return activeGroupId || stored;
}
