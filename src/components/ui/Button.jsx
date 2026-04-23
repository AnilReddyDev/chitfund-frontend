// src/components/ui/Button.jsx
const Button = ({ children, onClick, variant = "primary" }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full py-2 rounded-xl font-medium ${
        variant === "primary"
          ? "bg-green-600 text-black"
          : "bg-green-500 text-black"
      }`}
    >
      {children}
    </button>
  );
};

export default Button;