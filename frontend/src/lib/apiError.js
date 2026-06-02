export function getApiErrorMessage(err, fallback = "Request failed") {
  const status = err?.response?.status;
  const data = err?.response?.data;

  if (status === 429) {
    return "Too many requests. Please wait a bit and try again.";
  }

  if (typeof data === "string" && data.trim()) return data;

  const nested =
    data?.error?.message ||
    data?.message ||
    data?.error ||
    data?.detail ||
    err?.message;

  if (typeof nested === "string" && nested.trim()) return nested;

  return fallback;
}

