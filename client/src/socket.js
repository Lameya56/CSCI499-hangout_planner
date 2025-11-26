// src/socket.js
import { io } from "socket.io-client";

const SOCKET_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3001" // local dev
    : "https://lets-go.site"; // EC2 server port

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  withCredentials: true,
});

