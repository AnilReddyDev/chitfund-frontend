const Header = ({ title }) => {
  return (
    <div className="sticky top-0 bg-white p-4 shadow z-10">
      <h1 className="text-lg font-semibold">{title}</h1>
    </div>
  );
};

export default Header;