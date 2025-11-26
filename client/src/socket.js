import { io } from "socket.io-client";

const IS_LOCAL = import.meta.env.VITE_LOCAL === "TRUE";

const SOCKET_URL = IS_LOCAL
  ? import.meta.env.VITE_BACKEND_URL
  : import.meta.env.VITE_SOCKET_URL;;



export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  withCredentials: true,
});

