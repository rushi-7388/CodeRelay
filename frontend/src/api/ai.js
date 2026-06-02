import axiosInstance from "../lib/axios";

export const aiApi = {
    analyzeCode: async (data) => {
        const response = await axiosInstance.post("/ai/analyze", data);
        return response.data;
    },
    getHint: async (data) => {
        const response = await axiosInstance.post("/ai/hint", data);
        return response.data;
    },
    explainError: async (data) => {
        const response = await axiosInstance.post("/ai/explain-error", data);
        return response.data;
    },
    optimizeCode: async (data) => {
        const response = await axiosInstance.post("/ai/optimize", data);
        return response.data;
    },
    reviewCode: async (data) => {
        const response = await axiosInstance.post("/ai/review", data);
        return response.data;
    },
    chatWithAI: async (data) => {
        const response = await axiosInstance.post("/ai/chat", data);
        return response.data;
    },
};
