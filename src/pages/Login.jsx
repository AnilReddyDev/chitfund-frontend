import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import LanguageSelector from "../components/i18n/LanguageSelector";

export default function Login() {
  const navigate = useNavigate();
  const { login, t } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.username, formData.password);
      toast.success(t("loginSuccess"));
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(error.message || t("loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <div className="mb-5 flex justify-end">
          <LanguageSelector />
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ChitFund</h1>
          <p className="text-gray-600">{t("signInSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("username")}
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder={t("enterUsername")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("password")}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t("enterPassword")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t("signingIn") : t("signIn")}
          </Button>
        </form>
        <div className="py-4 text-center"></div>
      </Card>
    </div>
  );
}
