import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { hasAnyPermission } from "../../utils/permissions";

export default function Can({ permissions = [], fallback = null, children }) {
  const { role } = useContext(AppContext);

  if (!hasAnyPermission(permissions, role)) {
    return fallback;
  }

  return children;
}
