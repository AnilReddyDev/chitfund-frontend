// src/components/group/GroupCard.jsx
import { useNavigate } from "react-router-dom";

export default function GroupCard({ group }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/group/${group.id}/members`)}
      className="bg-white p-4 m-4 rounded-lg shadow-[#ffffff1a_0px_1px_1px_0px_inset,#32325d40_0px_50px_100px_-20px,#0000004d_0px_30px_60px_-30px]"

    >
      <h2 className="font-semibold text-gray-800">{group.name}</h2>
      <p className="text-sm text-gray-500">₹{group.totalAmount}</p>
    </div>
  );
}