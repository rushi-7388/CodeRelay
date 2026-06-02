import axiosInstance from "../lib/axios";

export const userApi = {
    getUserStats: async () => {
        const { data } = await axiosInstance.get("/users/stats");
        return data;
    },
    updateProfile: async (profileData) => {
        const { data } = await axiosInstance.put("/users/profile", profileData);
        return data;
    },
    getLeaderboard: async () => {
        const { data } = await axiosInstance.get("/users/leaderboard");
        return data.topUsers;
    }
};
