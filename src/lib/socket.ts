import { io } from 'socket.io-client';

// The socket connects to the same host as the applet.
// We must allow default transports (polling -> websocket upgrade) for serverless/Vercel compatibility.
export const socket = io({
  path: '/socket.io/',
});
