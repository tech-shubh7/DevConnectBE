const mongoose = require("mongoose");

const connectionRequestSchema=new mongoose.Schema({
    fromUserId: {       
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        requird:true,    
        enum:{
            values: ["interested","ignored","accepted", "rejected"],
            message: `{VALUE} is not a valid status`
    },
 },
  
},
 {
     timestamps:true,
 }
);

//for query optimization and making query fast searching fast
connectionRequestSchema.index({fromUserId:1,toUserId:1});

connectionRequestSchema.pre("save", function (next) {
   
    const conncetionRequest=this;
    //check if the fromUserId and toUserId are the same
    if (conncetionRequest.fromUserId.toString() === conncetionRequest.toUserId.toString()) {
        throw new Error("You cannot send a connection request to yourself.");
    }     
    next();

});

const ConnectionRequestModel = mongoose.model("ConnectionRequest", connectionRequestSchema);
module.exports = { ConnectionRequestModel };

// This schema defines a connection request between two users in the application.
// It includes fields for the sender and receiver (both referencing the User model),
// the status of the request (pending, accepted, or rejected), and timestamps for creation and updates.
// The pre-save hook updates the updatedAt field to the current date and time whenever a connection request is saved.
// This schema can be used to manage connection requests in a social networking or professional networking application.
// The ConnectionRequest model can be used to create, read, update, and delete connection requests in the database.
