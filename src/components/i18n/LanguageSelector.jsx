import { useContext } from "react";
import { Languages } from "lucide-react";
import { AppContext } from "../../context/AppContext";
import { LANGUAGES, translate } from "../../utils/i18n";

export default function LanguageSelector({ compact = false }) {
  const {
    language = "en",
    setLanguage = () => {},
    t = (key, values) => translate("en", key, values),
  } = useContext(AppContext);

  return (
    <label
      className={`inline-flex items-center gap-2 rounded-lg ${
        compact ? "bg-white/15 px-2 py-1 text-white" : "bg-white px-3 py-2 text-slate-700"
      }`}
    >
      <Languages size={16} />
      <span className="sr-only">{t("language")}</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        className={`bg-transparent text-xs font-semibold outline-none ${
          compact ? "text-white" : "text-slate-700"
        }`}
      >
        {LANGUAGES.map((item) => (
          <option key={item.code} value={item.code} className="text-slate-950">
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}
