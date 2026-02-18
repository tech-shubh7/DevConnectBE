const socketIO = require("socket.io");
const crypto = require("crypto");
const { messageModel } = require("../models/Message");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  if (!server) {
    throw new Error("Server instance is required");
  }

  const io = socketIO(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Join chat room
    socket.on("joinChat", ({ userId, targetUserId }) => {
      if (!userId || !targetUserId) return;

      const roomId = getSecretRoomId(userId, targetUserId);
      socket.join(roomId);

      console.log(`User ${userId} joined room ${roomId}`);
    });

    // Send message
    socket.on("sendMessage", async ({ userId, targetUserId, text }) => {
      if (!userId || !targetUserId || !text?.trim()) return;

      try {
        const roomId = getSecretRoomId(userId, targetUserId);

        //  SAVE MESSAGE FIRST 
        const savedMessage = await messageModel.create({
          senderId: userId,
          receiverId: targetUserId,
          messageText: text,
          roomId: roomId,
        });

        //  EMIT ONLY AFTER SAVE SUCCESS
        io.to(roomId).emit("messageReceived", {
          _id: savedMessage._id,
          senderId: savedMessage.senderId,
          receiverId: savedMessage.receiverId,
          text: savedMessage.messageText,
          createdAt: savedMessage.createdAt,
        });
      } catch (error) {
        console.error("Failed to send message:", error.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};

module.exports = { initializeSocket };
