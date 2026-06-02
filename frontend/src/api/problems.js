import axiosInstance from "../lib/axios";

export const problemApi = {
    getProblems: async () => {
        const { data } = await axiosInstance.get("/problems");
        return data.problems;
    },

    getProblemById: async (problemId) => {
        const { data } = await axiosInstance.get(`/problems/${problemId}`);
        return data.problem;
    },

    // Admin methods
    createProblem: async (problemData) => {
        const { data } = await axiosInstance.post("/problems", problemData);
        return data.problem;
    },

    updateProblem: async (id, problemData) => {
        const { data } = await axiosInstance.put(`/problems/${id}`, problemData);
        return data.problem;
    },

    deleteProblem: async (id) => {
        const { data } = await axiosInstance.delete(`/problems/${id}`);
        return data;
    },
};
