import { Home, List, BarChart, Users, Hammer } from "lucide-react";
import { Link } from "react-router-dom";

const BottomNav = () => {
  return (
    <div className="fixed bottom-0 w-full bg-white shadow flex justify-around p-2">
      <Link to="/"><Home /></Link>
      <Link to="/ledger"><List /></Link>
      <Link to="/dashboard"><BarChart /></Link>
      <Link to="/members"><Users /></Link>
      <Link to="/auction"><Hammer /></Link>
    </div>
  );
};

export default BottomNav;