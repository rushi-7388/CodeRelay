import axiosInstance from "../lib/axios";

export const paymentApi = {
    getPlans: async () => {
        const response = await axiosInstance.get("/payments/plans");
        return response.data;
    },
    createCheckoutSession: async (data) => {
        const response = await axiosInstance.post("/payments/checkout", data);
        return response.data;
    },
    createPortalSession: async (organizationId) => {
        const response = await axiosInstance.post("/payments/portal", { organizationId });
        return response.data;
    },
    getSubscription: async (organizationId) => {
        const response = await axiosInstance.get(`/payments/subscription/${organizationId}`);
        return response.data;
    },
};
