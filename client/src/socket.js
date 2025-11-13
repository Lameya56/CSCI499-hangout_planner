// src/socket.js
import { io } from "socket.io-client";

const SOCKET_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3001" // local dev
    : "http://35.92.203.139:3001"; // your EC2/Tailscale server port

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  withCredentials: true,
});
