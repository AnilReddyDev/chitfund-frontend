import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

// Create a separate axios instance for auth (no token needed)
const authApi = axios.create({
  baseURL: API_BASE_URL,
});

export const authService = {
  // Login with username and password
  login: async (username, password) => {
    try {
      const response = await authApi.post("/auth/login", {
        username,
        password,
      });
      const { token, username: user, role } = response.data;

      // Store token and user info in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ username: user, role }));

      return { token, username: user, role };
    } catch (error) {
      throw error.response?.data?.message || "Login failed";
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem("token");
  },

  // Get stored user info
  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },
};
