import { useMutation } from "@tanstack/react-query";
import { aiApi } from "../api/ai";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "../lib/apiError";

export const useAIAnalyze = () => {
    return useMutation({
        mutationFn: aiApi.analyzeCode,
        onError: (err) => toast.error(getApiErrorMessage(err, "AI analysis failed")),
    });
};

export const useAIOptimize = () => {
    return useMutation({
        mutationFn: aiApi.optimizeCode,
        onError: (err) => toast.error(getApiErrorMessage(err, "AI optimization failed")),
    });
};

export const useAIExplainError = () => {
    return useMutation({
        mutationFn: aiApi.explainError,
        onError: (err) => toast.error(getApiErrorMessage(err, "AI explanation failed")),
    });
};

export const useAIChat = () => {
    return useMutation({
        mutationFn: aiApi.chatWithAI,
        onError: (err) => toast.error(getApiErrorMessage(err, "AI chat failed")),
    });
};
