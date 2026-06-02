import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { paymentApi } from "../api/payments";

export const usePlans = () => {
    return useQuery({
        queryKey: ["plans"],
        queryFn: paymentApi.getPlans,
    });
};

export const useCheckoutSession = () => {
    return useMutation({
        mutationKey: ["checkoutSession"],
        mutationFn: paymentApi.createCheckoutSession,
        onSuccess: (data) => {
            if (data.url) {
                window.location.href = data.url;
            }
        },
        onError: (error) => toast.error(error.response?.data?.message || "Checkout failed"),
    });
};

export const usePortalSession = () => {
    return useMutation({
        mutationKey: ["portalSession"],
        mutationFn: paymentApi.createPortalSession,
        onSuccess: (data) => {
            if (data.url) {
                window.location.href = data.url;
            }
        },
        onError: (error) => toast.error(error.response?.data?.message || "Failed to open billing portal"),
    });
};

export const useSubscription = (organizationId) => {
    return useQuery({
        queryKey: ["subscription", organizationId],
        queryFn: () => paymentApi.getSubscription(organizationId),
        enabled: !!organizationId,
    });
};
