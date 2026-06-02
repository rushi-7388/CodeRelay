import axios from "axios";
import { config } from "./config";

const axiosInstance = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true, // by adding this field browser will send the cookies to server automatically, on every single req
});

export default axiosInstance;
