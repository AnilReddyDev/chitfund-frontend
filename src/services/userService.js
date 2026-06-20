import api from "./api";

export const userService = {
  list: async (params = {}) => {
    const response = await api.get("/users", { params });
    return response.data;
  },

  create: async (payload) => {
    const response = await api.post("/users", payload);
    return response.data;
  },

  update: async (id, payload) => {
    const response = await api.put(`/users/${id}`, payload);
    return response.data;
  },

  updateStatus: async (id, active) => {
    const response = await api.patch(`/users/${id}/status`, { active });
    return response.data;
  },
};
