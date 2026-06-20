import api from "./api";

export const auditService = {
  list: async (params = {}) => {
    const response = await api.get("/audit-logs", { params });
    return response.data;
  },

  get: async (id) => {
    const response = await api.get(`/audit-logs/${id}`);
    return response.data;
  },
};
