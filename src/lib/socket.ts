import { io } from 'socket.io-client';

// Ultra-low latency configuration:
// Prioritizes direct WebSocket for sub-5ms local network response time
export const socket = io({
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 500,
  timeout: 10000,
});

