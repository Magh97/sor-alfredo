import 'dotenv/config';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { app } from './app.js';

const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173', methods: ['GET', 'POST'] },
});

const port = parseInt(process.env.PORT ?? '3000', 10);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

async function shutdown(signal: string) {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  server.close(() => { console.log('HTTP server closed'); });
  io.close(() => { console.log('Socket.io server closed'); });
  process.exit(0);
}

process.on('SIGTERM', () => { void shutdown('SIGTERM'); });
process.on('SIGINT', () => { void shutdown('SIGINT'); });

export { io };
