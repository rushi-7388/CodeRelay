import axios from "axios";
import { config } from "./config";

const axiosInstance = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
});

export function updateAxiosBaseUrl(apiUrl) {
  if (apiUrl) axiosInstance.defaults.baseURL = apiUrl.replace(/\/$/, "");
}

export default axiosInstance;
