// src/components/ui/Card.jsx
const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-sm p-4 ${className}`}>
      {children}
    </div>
  );
};

export default Card;