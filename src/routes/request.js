const express = require('express');
const requestRouter = express.Router();
const { userAuth } = require('../middlewares/auth');
const { User } = require('../models/user.js');
const mongoose = require('mongoose');
const { sendInterestEmail } = require('../utils/emailService.js');
const { ConnectionRequestModel } = require('../models/conncetionRequest.js');


// Route to send a connection request
// This route allows a user to send a connection request to another user.
// It requires the user to be authenticated and provides the status of the request.
requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;

    if (!fromUserId || !toUserId || !status) {
      return res.status(400).send("Please provide all required fields");
    }

    if (status !== "interested" && status !== "ignored") {
      return res.status(400).send("Invalid status. Only 'interested' or 'ignored' are allowed.");
    }

    // Fetch users
    const toUser = await User.findById(toUserId);
    const fromUser = await User.findById(fromUserId);
    if (!toUser || !fromUser) {
      return res.status(404).send("User not found");
    }

    // Send email only if status is "interested"
    if (status === "interested") {
      await sendInterestEmail(toUser.emailId, fromUser.firstName || "A developer");
    }

    const existingRequest = await ConnectionRequestModel.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId }
      ]
    });
    if (existingRequest) {
      return res.status(409).send("Connection request already sent.");
    }

    const connectionRequest = new ConnectionRequestModel({
      fromUserId,
      toUserId,
      status
    });

    const savedRequest = await connectionRequest.save();

    res.status(201).send({
      message: "Connection request sent successfully",
      connectionRequest: savedRequest
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});


//accept or reject request api
requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {

  //logic
  //status must be accepted or rejected validate the status
  //if shubh is sending request to elon then first check will be
  //we have to check if elon is login or not to accept request
  //if status is ignored then no one can change it to accpted or rejected 
  //status must be interested to call this api 
  //check if requestId is valid or not it must be present in db 
  //and many more corner cases 
  try {
    const { status, requestId } = req.params;
    const loggedInUser = req.user;

    //  1. Validate status
    const validStatuses = ["accepted", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Status must be either 'accepted' or 'rejected'." });
    }

    // 2. Validate requestId format
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "Invalid request ID format." });
    }

    //  3. Check if request exists
    const connectionRequest = await ConnectionRequestModel.findById(requestId);
    if (!connectionRequest) {
      return res.status(404).json({ message: "Connection request not found." });
    }

    //  4. Only receiver (toUser) can accept or reject
    if (connectionRequest.toUserId.toString() !== loggedInUser._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to review this request." });
    }

    //  5. Block changing status if already 'accepted', 'rejected', or 'ignored'
    const currentStatus = connectionRequest.status;
    if (["accepted", "rejected", "ignored"].includes(currentStatus)) {
      return res.status(400).json({
        message: `Cannot change status of a request that is already '${currentStatus}'.`
      });
    }

    //  6. Update the status
    connectionRequest.status = status;

    await connectionRequest.save();

    return res.status(200).json({
      message: `Request has been ${status} successfully.`,
      request: connectionRequest
    });

  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
})

module.exports = requestRouter;