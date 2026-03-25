import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from './utils/jwt';
import { logger } from './utils/logger';

let io: Server;

export function getIO(): Server {
  return io;
}

export function setupSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'development' ? true : process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  // Auth is optional — guests get public events, logged users get private
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token) {
      try {
        const payload = verifyAccessToken(token);
        (socket as any).userId = payload.userId;
        (socket as any).role = payload.role;
      } catch {
        // Invalid token — connect as guest
      }
    }
    next();
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    if (userId) socket.join(`user:${userId}`);

    // Everyone joins public room for deal updates
    socket.join('public');

    socket.on('join:deal', (dealId: string) => {
      socket.join(`deal:${dealId}`);
    });

    socket.on('leave:deal', (dealId: string) => {
      socket.leave(`deal:${dealId}`);
    });

    socket.on('join:conversation', (conversationId: string) => {
      if (userId) socket.join(`conversation:${conversationId}`);
    });

    socket.on('chat:typing', (data: { conversationId: string }) => {
      if (userId) socket.to(`conversation:${data.conversationId}`).emit('chat:typing', { userId, conversationId: data.conversationId });
    });

    socket.on('disconnect', () => {});
  });

  return io;
}
