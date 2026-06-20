import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import PageShell, { StatePanel } from "../layout/PageShell";

export default function AccessDenied() {
  return (
    <PageShell title="Access Denied" subtitle="Permission required">
      <StatePanel
        icon={<ShieldAlert size={22} />}
        title="Access denied"
        message="Your current role does not have permission to view this page."
        actionLabel="Go to groups"
        onAction={() => {
          window.location.href = "/";
        }}
      />
      <div className="mt-3 text-center">
        <Link to="/" className="text-sm font-semibold text-white underline">
          Return to dashboard
        </Link>
      </div>
    </PageShell>
  );
}
