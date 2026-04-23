// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GroupPortal from "./pages/GroupPortal";
import Ledger from "./pages/Ledger";
import Dashboard from "./pages/Dashboard";
import Auction from "./pages/Auction";
import MemberHistory from "./pages/MemberHistory";
import BottomNav from "./components/layout/BottomNav";
import GroupMemberHistory from "./pages/GroupMembersHistory";

function App() {
  return (
    <BrowserRouter>
      <div className="pb-16">
        <Routes>
          <Route path="/" element={<GroupPortal />} />
          <Route path="/ledger" element={<Ledger />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/auction" element={<Auction />} />
          <Route path="/members" element={<MemberHistory />} />
          <Route path="/group/:groupId" element={<GroupMemberHistory />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
