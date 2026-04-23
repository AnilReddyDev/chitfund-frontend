// src/components/ui/FAB.jsx
import { Plus } from "lucide-react";

const FAB = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 bg-green-500 text-black p-4 rounded-full shadow-lg"
    >
      <Plus size={20} />
    </button>
  );
};

export default FAB;