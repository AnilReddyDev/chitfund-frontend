// src/App.jsx
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useContext } from "react";

import GroupPortal from "./pages/GroupPortal";
import Ledger from "./pages/Ledger";
import Dashboard from "./pages/Dashboard";
import Auction from "./pages/Auction";
import MemberHistory from "./pages/MemberHistory";
import GroupMemberHistory from "./pages/GroupMembersHistory";
import Login from "./pages/Login";

import BottomNav from "./components/layout/BottomNav";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import { AppContext } from "./context/AppContext";

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
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Routes key={location.pathname}>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <GroupPortal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/group/:groupId"
          element={
            <ProtectedRoute>
              <GroupMemberHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/group/:groupId/ledger"
          element={
            <ProtectedRoute>
              <Ledger />
            </ProtectedRoute>
          }
        />
        <Route
          path="/group/:groupId/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/group/:groupId/auction"
          element={
            <ProtectedRoute>
              <Auction />
            </ProtectedRoute>
          }
        />
        <Route
          path="/group/:groupId/members"
          element={
            <ProtectedRoute>
              <GroupMemberHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/members"
          element={
            <ProtectedRoute>
              <MemberHistory />
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
