import { io } from "socket.io-client";
import { config } from "./config";

const SOCKET_URL = config.apiUrl ? config.apiUrl.replace("/api", "") : "http://localhost:5000";

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
});
