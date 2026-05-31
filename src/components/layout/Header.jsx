const Header = ({ title, subtitle }) => {
  return (
    <div className="sticky top-0 z-10 border-b border-white/20 bg-white/15 px-4 py-3 text-white backdrop-blur-xl">
      <h1 className="text-lg font-semibold leading-6">{title}</h1>
      {subtitle && <p className="text-xs text-white/75">{subtitle}</p>}
    </div>
  );
};

export default Header;
