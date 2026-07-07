import { useContext } from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import LanguageSelector from "../i18n/LanguageSelector";
import { translate } from "../../utils/i18n";

const Header = ({ title, subtitle }) => {
  const navigate = useNavigate();
  const { user, logout, t = (key, values) => translate("en", key, values) } =
    useContext(AppContext);

  const handleLogout = () => {
    logout();
    toast.success(t("loggedOut"));
    navigate("/login", { replace: true });
  };

  return (
    <div className="sticky top-0 z-10 border-b border-white/20 bg-white/15 px-4 py-3 text-white backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold leading-6">{title}</h1>
          {subtitle && <p className="text-xs text-white/75">{subtitle}</p>}
        </div>
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-medium text-white">{user.username}</p>
              <p className="text-xs text-white/75 uppercase">{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 hover:bg-white/20 transition-colors"
              title={t("logout")}
            >
              <LogOut size={18} />
            </button>
            <LanguageSelector compact />
          </div>
        )}
        {!user && <LanguageSelector compact />}
      </div>
    </div>
  );
};

export default Header;
