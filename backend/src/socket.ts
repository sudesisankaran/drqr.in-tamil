import { Server } from "socket.io";
import supabase from "./config/supabase";
import { createClient } from "@supabase/supabase-js";

let io: Server | null = null;
const userSockets = new Map<string, Set<string>>();

const addUserSocket = (userId: string, socketId: string) => {
  const sockets = userSockets.get(userId) || new Set<string>();
  sockets.add(socketId);
  userSockets.set(userId, sockets);
};

const removeUserSocket = (userId: string, socketId: string) => {
  const sockets = userSockets.get(userId);
  if (!sockets) return;

  sockets.delete(socketId);
  if (!sockets.size) userSockets.delete(userId);
};

export const initSocket = (httpServer: any) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    try {
      const { data: authData, error } = await supabase.auth.getUser(token);
      if (error || !authData.user) throw new Error("Unauthorized");
      
      const authSupabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!, {
        global: { headers: { Authorization: `Bearer ${token}` } }
      });
      
      const { data: userData } = await authSupabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single();
        
      socket.data.user = userData;
      next();
    } catch {
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
      if (userId) removeUserSocket(userId, socket.id);
    });
  });

  return io;
};

export const emitToUser = (userId: string, event: string, payload: unknown) => {
  io?.to(`user:${userId}`).emit(event, payload);
};
