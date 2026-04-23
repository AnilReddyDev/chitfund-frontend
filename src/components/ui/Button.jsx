// src/components/ui/Button.jsx
const Button = ({ children, onClick, variant = "primary" }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full py-2 rounded-xl font-medium ${
        variant === "primary"
          ? "bg-black text-white"
          : "bg-gray-100 text-black"
      }`}
    >
      {children}
    </button>
  );
};

export default Button;