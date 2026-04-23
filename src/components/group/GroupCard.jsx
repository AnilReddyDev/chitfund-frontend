import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
export default function GroupCard({ group }) {
  const navigate = useNavigate();
const { setGroupId } = useContext(AppContext);
  return (
    <div
      onClick={() => {
        navigate(`/group/${group.id}`)
        setGroupId(group.id)
      }}
      
      className="bg-white p-4 rounded-xl shadow mb-3 cursor-pointer"
    >
      <h2 className="font-semibold">{group.name}</h2>
      <p className="text-sm text-gray-500">
        ₹{group.totalAmount}
      </p>
    </div>
  );
}