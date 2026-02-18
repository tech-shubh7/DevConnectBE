const express = require("express");
const crypto = require("crypto");
const messageRouter = express.Router();
const { messageModel } = require("../models/Message");
const { userAuth } = require("../middlewares/auth");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

messageRouter.get("/messages/:userId/:targetUserId", userAuth, async (req, res) => {
  try {
    const { userId, targetUserId } = req.params;

    if (!userId || !targetUserId) {
      return res.status(400).json({ message: "userId and targetUserId are required" });
    }

    // 1️⃣ generate roomId (same as socket)
    const roomId = getSecretRoomId(userId, targetUserId);

    // 2️⃣ fetch messages from DB
    const messages = await messageModel.find({ roomId }).sort({ createdAt: 1 }); // old → new

    // 3️⃣ send response
    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}
);

module.exports = messageRouter;
