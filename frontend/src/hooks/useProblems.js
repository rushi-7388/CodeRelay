import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { problemApi } from "../api/problems";
import toast from "react-hot-toast";

export const useProblems = () => {
    return useQuery({
        queryKey: ["problems"],
        queryFn: problemApi.getProblems,
    });
};

export const useProblemById = (id) => {
    return useQuery({
        queryKey: ["problem", id],
        queryFn: () => problemApi.getProblemById(id),
        enabled: !!id,
    });
};

export const useCreateProblem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: problemApi.createProblem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["problems"] });
            toast.success("Problem created successfully");
        },
        onError: (error) => toast.error(error.message || "Failed to create problem"),
    });
};

export const useUpdateProblem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }) => problemApi.updateProblem(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["problems"] });
            toast.success("Problem updated successfully");
        },
        onError: (error) => toast.error(error.message || "Failed to update problem"),
    });
};

export const useDeleteProblem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: problemApi.deleteProblem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["problems"] });
            toast.success("Problem deleted successfully");
        },
        onError: (error) => toast.error(error.message || "Failed to delete problem"),
    });
};
