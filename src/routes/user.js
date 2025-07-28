const express=require("express");
const { userAuth } = require("../middlewares/auth");
const { ConnectionRequestModel } = require("../models/conncetionRequest");
const { User } = require("../models/user");
const userRouter=express.Router();

//get all the pending conncetion request for the loggedIn user
userRouter.get("/user/requests/received",userAuth,async (req,res)=>{
       
    try{
        const loggedInUser=req.user;
        
        const connectionRequests=await ConnectionRequestModel.find({
            $and:  [
            {toUserId:loggedInUser._id},
            {status:"interested"}
            ]
       }).populate("fromUserId",["firstName","lastName","profilePicture","age","gender","bio","skills"]);
        //populate is used to get the data of the user who sent the request
        //it will return the firstName and lastName of the user who sent the request



        res.json({
            message:"Data fetched successfully",
            "Total requests":connectionRequests.length,
            "All requests":connectionRequests
        });


    } catch(err){
        res.status(400).send("ERROR : "+err.message);
    }
})


userRouter.get("/user/connections",userAuth,async (req,res)=>{

    try{

        const loggedInUser=req.user;

        const connections=await ConnectionRequestModel.find({
            $or: [
                {fromUserId:loggedInUser._id, status:"accepted"},
                {toUserId:loggedInUser._id, status:"accepted"}
            ]
        }).populate("fromUserId",["firstName","lastName","profilePicture","age","gender","bio","skills"])
          .populate("toUserId",["firstName","lastName","profilePicture","age","gender","bio","skills"]);
        //populate is used to get the data of the user who sent the request 
        //it will return the firstName and lastName of the user who sent the request
       
        const data=connections.map((row)=>{
            //if the loggedIn user is the receiver of the request then return the sender's data
            //else return the receiver's data
            if(row.fromUserId._id.toString()===loggedInUser._id.toString()){
                return  row.toUserId
            } 
            //if the loggedIn user is the sender of the request then return the receiver's data
            //else return the sender's data
             return row.fromUserId;
            
    });

        res.json({
            message:"Data fetched successfully",
            "Total connections":connections.length,
            "All connections":data
        });
        

    } catch(err){
        res.status(400).send("ERROR : "+err.message);
    }
})

//feed api gets you profiles of other users on platform
userRouter.get("/user/feed",userAuth,async (req,res)=>{

    try{
 
  const loggedInUserId = req.user._id;

    const page = parseInt(req.query.page) || 1;    
    let limit = parseInt(req.query.limit) || 10; 
    limit= limit > 50 ? 50 : limit; // Limit to a maximum of 50 users per page
    // Ensure limit is a positive number
    if (limit < 1) {
      return res.status(400).json({ message: "Limit must be a positive number." });
    }
    const skip = (page - 1) * limit;               // Calculate the number of documents to skip for pagination

    // Step 1: Find all user IDs the logged-in user already interacted with
    const sentRequests = await ConnectionRequestModel.find({ fromUserId: loggedInUserId })
      .select("toUserId")      // Select only the toUserId field for sent requests
      .lean();            // Get only the toUserId field for sent requests

    const receivedRequests = await ConnectionRequestModel.find({ toUserId: loggedInUserId })
      .select("fromUserId")    // Select only the fromUserId field for received requests
      .lean();               
     

    // Flatten IDs to exclude
    const excludedUserIds = new Set([
      ...sentRequests.map(r => r.toUserId.toString()),
      ...receivedRequests.map(r => r.fromUserId.toString()),
      loggedInUserId.toString()
    ]);
    //console.log("Excluded User IDs:", excludedUserIds);

    // Step 2: Query users not in excluded list
    const users = await User.find({
      _id: { $nin: Array.from(excludedUserIds) }  // Exclude users already interacted with
    })
      .select("firstName lastName profilePicture bio skills age gender") // Include only public fields
      .sort({ createdAt: -1 }) // Optional: latest users first
      .skip(skip)   // Skip users based on pagination
      .limit(limit) // Limit to the specified number of users
      .lean();   // Convert to plain objects for easier manipulation

    // Step 3: Return paginated feed
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found for the feed." });
    }


    // Optional: Format users with fixed field order
    const formattedUsers = users.map(user => ({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture,
      age: user.age,
      gender: user.gender,
      bio: user.bio,
      skills: user.skills
    }));

    res.status(200).json({
      message: "Feed fetched successfully",
      page,
      limit,
      total: formattedUsers.length,
      feed: formattedUsers
    });


    } catch(err){
        res.status(400).send("ERROR : "+ err.message);
    }
})



module.exports=userRouter;
