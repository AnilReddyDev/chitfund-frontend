import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { hasAnyPermission } from "../../utils/permissions";
import AccessDenied from "./AccessDenied";

export default function RoleGuard({ permissions = [], children }) {
  const { role, loading } = useContext(AppContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!hasAnyPermission(permissions, role)) {
    return <AccessDenied />;
  }

  return children;
}
