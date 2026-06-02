import { Server } from "socket.io";
import { createServer } from "http";
import { ENV } from "../lib/env.js";

let io;

export function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: [ENV.CLIENT_URL, "http://localhost:5173", "http://127.0.0.1:5173"],
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  const activeUsers = new Map();
  const collaborationRooms = new Map();
  const codeEditorState = new Map();

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("authenticate", (data) => {
      const { userId, userName, userImage } = data;
      socket.userId = userId;
      socket.userName = userName;
      socket.userImage = userImage;
      activeUsers.set(socket.id, {
        socketId: socket.id,
        userId,
        userName,
        userImage,
        connectedAt: new Date(),
      });
      socket.join(`user:${userId}`);
    });

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      const roomUsers = collaborationRooms.get(roomId) || new Map();

      if (socket.userId) {
        roomUsers.set(socket.userId, {
          socketId: socket.id,
          userId: socket.userId,
          userName: socket.userName,
          userImage: socket.userImage,
          cursor: null,
          selection: null,
          joinedAt: new Date(),
        });
        collaborationRooms.set(roomId, roomUsers);
      }

      socket.to(roomId).emit("user-joined", {
        userId: socket.userId,
        userName: socket.userName,
        userImage: socket.userImage,
        users: Array.from(roomUsers.values()),
      });

      socket.emit("room-state", {
        users: Array.from(roomUsers.values()),
        code: codeEditorState.get(roomId) || "",
      });
    });

    socket.on("leave-room", (roomId) => {
      socket.leave(roomId);
      const roomUsers = collaborationRooms.get(roomId);
      if (roomUsers && socket.userId) {
        roomUsers.delete(socket.userId);
        collaborationRooms.set(roomId, roomUsers);

        socket.to(roomId).emit("user-left", {
          userId: socket.userId,
          users: Array.from(roomUsers.values()),
        });
      }
    });

    socket.on("code-change", (data) => {
      const { roomId, code, cursorPosition, branchName } = data;
      codeEditorState.set(roomId, code);

      socket.to(roomId).emit("code-update", {
        code,
        userId: socket.userId,
        userName: socket.userName,
        cursorPosition,
        branchName: branchName || "main"
      });
    });

    socket.on("cursor-move", (data) => {
      const { roomId, cursor, selection } = data;
      socket.to(roomId).emit("cursor-update", {
        userId: socket.userId,
        userName: socket.userName,
        cursor,
        selection,
      });
    });

    socket.on("selection-change", (data) => {
      const { roomId, selection } = data;
      socket.to(roomId).emit("selection-update", {
        userId: socket.userId,
        userName: socket.userName,
        selection,
      });
    });

    socket.on("language-change", (data) => {
      const { roomId, language } = data;
      socket.to(roomId).emit("language-update", {
        language,
        userId: socket.userId,
      });
    });

    socket.on("run-code", async (data) => {
      const { roomId, code, language, input } = data;
      socket.to(roomId).emit("code-running", {
        userId: socket.userId,
        userName: socket.userName,
      });
    });

    socket.on("code-output", (data) => {
      const { roomId, output, status, executionTime } = data;
      socket.to(roomId).emit("code-result", {
        output,
        status,
        executionTime,
        userId: socket.userId,
        userName: socket.userName,
      });
    });

    socket.on("sync-state", (data) => {
      const { roomId, code, language } = data;
      codeEditorState.set(roomId, code);
      socket.to(roomId).emit("state-sync", {
        code,
        language,
        userId: socket.userId,
      });
    });

    socket.on("chat-message", (data) => {
      const { roomId, message, type } = data;
      io.to(roomId).emit("chat-message", {
        id: Date.now().toString(),
        userId: socket.userId,
        userName: socket.userName,
        userImage: socket.userImage,
        message,
        type: type || "message",
        timestamp: new Date().toISOString(),
      });
    });

    socket.on("typing", (data) => {
      const { roomId, isTyping } = data;
      socket.to(roomId).emit("user-typing", {
        userId: socket.userId,
        userName: socket.userName,
        isTyping,
      });
    });

    // WebRTC Signaling
    socket.on("webrtc-signal", (data) => {
      const { targetUserId, type, signalData, roomId } = data;
      const roomUsers = collaborationRooms.get(roomId);
      if (roomUsers && roomUsers.has(targetUserId)) {
        const targetSocketId = roomUsers.get(targetUserId).socketId;
        io.to(targetSocketId).emit("webrtc-signal", {
          senderId: socket.userId,
          type,
          signalData
        });
      }
    });

    // User Media Status Change
    socket.on("media-status-change", (data) => {
      const { roomId, videoEnabled, audioEnabled } = data;
      socket.to(roomId).emit("user-media-status", {
        userId: socket.userId,
        videoEnabled,
        audioEnabled
      });
    });

    socket.on("follow-user", (data) => {
      const { roomId, targetUserId } = data;
      socket.to(roomId).emit("follow-cursor", {
        followerId: socket.userId,
        targetUserId,
        userName: socket.userName,
      });
    });

    socket.on("unfollow-user", (data) => {
      const { roomId, targetUserId } = data;
      socket.to(roomId).emit("unfollow-cursor", {
        followerId: socket.userId,
        targetUserId,
      });
    });

    socket.on("save-snippet", (data) => {
      const { roomId, name, code, language } = data;
      io.to(roomId).emit("snippet-saved", {
        name,
        code,
        language,
        userId: socket.userId,
        userName: socket.userName,
        timestamp: new Date().toISOString(),
      });
    });

    // Multiplayer Time Travel Debugging
    socket.on("time-travel-trace", (data) => {
      const { roomId, trace } = data;
      socket.to(roomId).emit("time-travel-trace", {
        trace,
        userId: socket.userId,
        userName: socket.userName,
      });
    });

    socket.on("time-travel-step", (data) => {
      const { roomId, step } = data;
      socket.to(roomId).emit("time-travel-step", {
        step,
        userId: socket.userId,
      });
    });

    // Autonomous AI Participant
    socket.on("spawn-ai", (data) => {
      const { roomId } = data;
      const roomUsers = collaborationRooms.get(roomId);
      if (roomUsers && !roomUsers.has("ai-bot")) {
        roomUsers.set("ai-bot", {
          socketId: "ai-bot",
          userId: "ai-bot",
          userName: "Devin (AI)",
          userImage: "https://api.dicebear.com/7.x/bottts/svg?seed=Devin",
          cursor: null,
          selection: null,
          joinedAt: new Date()
        });
        io.to(roomId).emit("user-joined", {
          userId: "ai-bot",
          userName: "Devin (AI)",
          userImage: "https://api.dicebear.com/7.x/bottts/svg?seed=Devin",
          users: Array.from(roomUsers.values())
        });
      }
    });

    socket.on("ai-action", (data) => {
      const { roomId, action, payload } = data;
      socket.to(roomId).emit("ai-action", { action, payload });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);

      activeUsers.delete(socket.id);

      collaborationRooms.forEach((roomUsers, roomId) => {
        if (roomUsers.has(socket.userId)) {
          roomUsers.delete(socket.userId);
          io.to(roomId).emit("user-left", {
            userId: socket.userId,
            users: Array.from(roomUsers.values()),
          });
        }
      });
    });

    socket.on("error", (error) => {
      console.error(`Socket error: ${socket.id}`, error);
    });
  });

  return io;
}

export function getIO() {
  return io;
}

export function emitToUser(userId, event, data) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

export function emitToRoom(roomId, event, data) {
  if (io) {
    io.to(roomId).emit(event, data);
  }
}

export function getRoomUsers(roomId) {
  const roomUsers = collaborationRooms.get(roomId);
  return roomUsers ? Array.from(roomUsers.values()) : [];
}

export function getActiveUsers() {
  return Array.from(activeUsers.values());
}
