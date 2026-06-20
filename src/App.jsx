// src/App.jsx
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useContext } from "react";

import GroupPortal from "./pages/GroupPortal";
import Ledger from "./pages/Ledger";
import Dashboard from "./pages/Dashboard";
import Auction from "./pages/Auction";
import MemberHistory from "./pages/MemberHistory";
import GroupMemberHistory from "./pages/GroupMembersHistory";
import Login from "./pages/Login";
import UserManagement from "./pages/UserManagement";
import AuditLogs from "./pages/AuditLogs";

import BottomNav from "./components/layout/BottomNav";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/auth/RoleGuard";
import { Toaster } from "react-hot-toast";
import { AppContext } from "./context/AppContext";
import { PERMISSIONS } from "./utils/permissions";

function App() {
  const { isAuthenticated, loading } = useContext(AppContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppRoutes isAuthenticated={isAuthenticated} />
    </BrowserRouter>
  );
}

function AppRoutes({ isAuthenticated }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RoleGuard permissions={[PERMISSIONS.GROUP_VIEW]}>
                <GroupPortal />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/group/:groupId"
          element={
            <ProtectedRoute>
              <Navigate to="members" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/group/:groupId/ledger"
          element={
            <ProtectedRoute>
              <RoleGuard permissions={[PERMISSIONS.REPORT_VIEW, PERMISSIONS.PAYMENT_VIEW]}>
                <Ledger />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/group/:groupId/dashboard"
          element={
            <ProtectedRoute>
              <RoleGuard permissions={[PERMISSIONS.DASHBOARD_VIEW]}>
                <Dashboard />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/group/:groupId/auction"
          element={
            <ProtectedRoute>
              <RoleGuard permissions={[PERMISSIONS.AUCTION_VIEW]}>
                <Auction />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/group/:groupId/members"
          element={
            <ProtectedRoute>
              <RoleGuard permissions={[PERMISSIONS.MEMBER_VIEW]}>
                <GroupMemberHistory />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/members"
          element={
            <ProtectedRoute>
              <RoleGuard permissions={[PERMISSIONS.MEMBER_VIEW]}>
                <MemberHistory />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/users"
          element={
            <ProtectedRoute>
              <RoleGuard permissions={[PERMISSIONS.USER_MANAGE]}>
                <UserManagement />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/audit-logs"
          element={
            <ProtectedRoute>
              <RoleGuard permissions={[PERMISSIONS.AUDIT_VIEW]}>
                <AuditLogs />
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/" : "/login"} />}
        />
      </Routes>

      {isAuthenticated && <BottomNav />}
      <Toaster position="top-center" />
    </div>
  );
}

export default App;
