import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/users";
import toast from "react-hot-toast";

export const useUserStats = () => {
    return useQuery({
        queryKey: ["userStats"],
        queryFn: userApi.getUserStats,
    });
};

export const useLeaderboard = () => {
    return useQuery({
        queryKey: ["leaderboard"],
        queryFn: userApi.getLeaderboard,
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: userApi.updateProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userStats"] });
            toast.success("Profile updated successfully");
        },
        onError: (error) => toast.error(error.message || "Failed to update profile"),
    });
};
