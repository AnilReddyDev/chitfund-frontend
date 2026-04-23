import { Home, List, BarChart, Users, Hammer } from "lucide-react";
import { Link } from "react-router-dom";
import useGroup from "../../hooks/useGroup";
const BottomNav = () => {
  const groupId = useGroup();
  return (
    <div className="fixed bottom-0 w-full flex justify-around p-2  bg-gray-400 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border-[0.5px] border-gray-100">
      <Link to="/"><Home /></Link>
      <Link to={`/group/${groupId}/ledger`}><List /></Link>
      <Link to={`/group/${groupId}/dashboard`}><BarChart /></Link>
      <Link to="/members"><Users /></Link>
      <Link to={`/group/${groupId}/auction`}><Hammer /></Link>
    </div>
  );
};

export default BottomNav;