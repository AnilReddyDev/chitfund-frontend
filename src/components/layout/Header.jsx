const Header = ({ title }) => {
  return (
    <div className="sticky top-0  p-4  z-10 bg-gray-400 rounded-sm bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border-[0.5px] border-gray-100">
      <h1 className="text-lg font-semibold">{title}</h1>
    </div>
  );
};

export default Header;