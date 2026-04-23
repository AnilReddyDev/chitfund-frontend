// src/components/ui/FAB.jsx
import { Plus } from "lucide-react";

const FAB = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 bg-black text-white p-4 rounded-full shadow-lg"
    >
      <Plus size={20} />
    </button>
  );
};

export default FAB;