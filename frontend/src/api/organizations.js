import axiosInstance from "../lib/axios";

export const organizationApi = {
    createOrganization: async (data) => {
        const response = await axiosInstance.post("/organizations", data);
        return response.data;
    },
    getOrganizations: async () => {
        const response = await axiosInstance.get("/organizations");
        return response.data;
    },
    getOrganization: async (id) => {
        const response = await axiosInstance.get(`/organizations/${id}`);
        return response.data;
    },
    updateOrganization: async (id, data) => {
        const response = await axiosInstance.put(`/organizations/${id}`, data);
        return response.data;
    },
    inviteMember: async (id, data) => {
        const response = await axiosInstance.post(`/organizations/${id}/members`, data);
        return response.data;
    },
};
