import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { organizationApi } from "../api/organizations";

export const useCreateOrganization = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["createOrganization"],
        mutationFn: organizationApi.createOrganization,
        onSuccess: () => {
            toast.success("Organization created!");
            queryClient.invalidateQueries({ queryKey: ["organizations"] });
        },
        onError: (error) => toast.error(error.response?.data?.message || "Failed to create organization"),
    });
};

export const useOrganizations = () => {
    return useQuery({
        queryKey: ["organizations"],
        queryFn: organizationApi.getOrganizations,
    });
};

export const useOrganization = (id) => {
    return useQuery({
        queryKey: ["organization", id],
        queryFn: () => organizationApi.getOrganization(id),
        enabled: !!id,
    });
};
