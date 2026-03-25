"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = getIO;
exports.setupSocket = setupSocket;
const socket_io_1 = require("socket.io");
const jwt_1 = require("./utils/jwt");
let io;
function getIO() {
    return io;
}
function setupSocket(httpServer) {
    io = new socket_io_1.Server(httpServer, {
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
                const payload = (0, jwt_1.verifyAccessToken)(token);
                socket.userId = payload.userId;
                socket.role = payload.role;
            }
            catch {
                // Invalid token — connect as guest
            }
        }
        next();
    });
    io.on('connection', (socket) => {
        const userId = socket.userId;
        if (userId)
            socket.join(`user:${userId}`);
        // Everyone joins public room for deal updates
        socket.join('public');
        socket.on('join:deal', (dealId) => {
            socket.join(`deal:${dealId}`);
        });
        socket.on('leave:deal', (dealId) => {
            socket.leave(`deal:${dealId}`);
        });
        socket.on('join:conversation', (conversationId) => {
            if (userId)
                socket.join(`conversation:${conversationId}`);
        });
        socket.on('chat:typing', (data) => {
            if (userId)
                socket.to(`conversation:${data.conversationId}`).emit('chat:typing', { userId, conversationId: data.conversationId });
        });
        socket.on('disconnect', () => { });
    });
    return io;
}
//# sourceMappingURL=socket.js.map