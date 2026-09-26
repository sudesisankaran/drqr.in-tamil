"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitToUser = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "SECRET_KEY";
let io = null;
const userSockets = new Map();
const addUserSocket = (userId, socketId) => {
    const sockets = userSockets.get(userId) || new Set();
    sockets.add(socketId);
    userSockets.set(userId, sockets);
};
const removeUserSocket = (userId, socketId) => {
    const sockets = userSockets.get(userId);
    if (!sockets)
        return;
    sockets.delete(socketId);
    if (!sockets.size)
        userSockets.delete(userId);
};
const initSocket = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "*",
            credentials: true,
        },
    });
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error("Unauthorized"));
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            socket.data.user = decoded;
            next();
        }
        catch {
            next(new Error("Unauthorized"));
        }
    });
    io.on("connection", (socket) => {
        const userId = socket.data.user?.id;
        if (userId) {
            addUserSocket(userId, socket.id);
            socket.join(`user:${userId}`);
        }
        socket.on("disconnect", () => {
            if (userId)
                removeUserSocket(userId, socket.id);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const emitToUser = (userId, event, payload) => {
    io?.to(`user:${userId}`).emit(event, payload);
};
exports.emitToUser = emitToUser;
