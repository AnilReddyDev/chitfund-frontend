import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

const EMPTY_GROUP = {};

export default function useGroupMeta() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(EMPTY_GROUP);

  useEffect(() => {
    let active = true;

    if (!groupId) {
      return undefined;
    }

    api
      .get("/groups")
      .then((res) => {
        if (!active) return;

        const groups = Array.isArray(res.data) ? res.data : [];
        const matchedGroup =
          groups.find((item) => String(item.id) === String(groupId)) ||
          EMPTY_GROUP;

        setGroup(matchedGroup);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Error loading group details", err);
        setGroup(EMPTY_GROUP);
      });

    return () => {
      active = false;
    };
  }, [groupId]);

  return useMemo(() => {
    const activeGroup = groupId ? group : EMPTY_GROUP;
    const name = resolveGroupName(activeGroup);
    const createdAt = resolveGroupCreatedAt(activeGroup);
    const createdLabel = formatGroupDate(createdAt);
    const displayName = groupId ? name || `Group ${groupId}` : "";

    return {
      groupId,
      group: activeGroup,
      groupName: name,
      displayName,
      createdAt,
      createdLabel,
      subtitle: groupId
        ? [displayName, createdLabel ? `Created ${createdLabel}` : ""]
            .filter(Boolean)
            .join(" • ")
        : "No group selected",
    };
  }, [group, groupId]);
}

export function resolveGroupName(group) {
  return group?.name || group?.groupName || group?.group?.name || "";
}

export function resolveGroupCreatedAt(group) {
  return (
    group?.createdAt ||
    group?.createdDate ||
    group?.createdOn ||
    group?.created_at ||
    group?.dateCreated ||
    group?.group?.createdAt ||
    ""
  );
}

export function formatGroupDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
