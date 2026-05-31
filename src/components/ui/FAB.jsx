// src/components/ui/FAB.jsx
import { Plus } from "lucide-react";

const FAB = ({ onClick }) => {
  return (
    <button
      type="button"
      aria-label="Add new item"
      onClick={onClick}
      className="fixed bottom-20 right-4 grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-slate-950 shadow-xl shadow-emerald-950/25 transition active:scale-95"
    >
      <Plus size={24} strokeWidth={2.5} />
    </button>
  );
};

export default FAB;
