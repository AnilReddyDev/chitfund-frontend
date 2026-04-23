// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import GroupPortal from "./pages/GroupPortal";
import Ledger from "./pages/Ledger";
import Dashboard from "./pages/Dashboard";
import Auction from "./pages/Auction";
import MemberHistory from "./pages/MemberHistory";
import GroupMemberHistory from "./pages/GroupMembersHistory";

import BottomNav from "./components/layout/BottomNav";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 pb-20">
        <Routes>
          {/* Home */}
          <Route path="/" element={<GroupPortal />} />

          {/* Group-based routes */}
          <Route path="/group/:groupId" element={<GroupMemberHistory />} />
          <Route path="/group/:groupId/ledger" element={<Ledger />} />
          <Route path="/group/:groupId/dashboard" element={<Dashboard />} />
          <Route path="/group/:groupId/auction" element={<Auction />} />
          <Route path="/group/:groupId/members" element={<GroupMemberHistory />} />


          {/* Members */}
          <Route path="/members" element={<MemberHistory />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;