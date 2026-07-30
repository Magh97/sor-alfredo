import 'dotenv/config';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { app } from './app.js';
import { registerKdsHandlers } from './modules/kds/kds.handler.js';

const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173', methods: ['GET', 'POST'] },
});

registerKdsHandlers(io);

const port = parseInt(process.env.PORT ?? '3000', 10);

server.listen(port, () => {
  console.info(`Server running on port ${String(port)}`);
});

function shutdown(signal: string) {
  console.info(`Received ${signal}. Starting graceful shutdown...`);
  server.close(() => { console.info('HTTP server closed'); });
  io.close(() => { console.info('Socket.io server closed'); });
  process.exit(0);
}

process.on('SIGTERM', () => { shutdown('SIGTERM'); });
process.on('SIGINT', () => { shutdown('SIGINT'); });

export { io };
