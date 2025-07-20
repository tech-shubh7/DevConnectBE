const express=require("express");
const {connectDB}=require("./config/database.js");
const app=express();
const {User}=require("./models/user.js");


app.use(express.json());


//User API - GET /feed - get user by email
app.get("/user",async (req,res)=>{

  try{
      const user=await User.find({emailId:req.body.emailId});
    //  const user=await User.find({_id:req.body._id});
       if( user.length==0 ){
              res.status(404).send("user not found");
       }
       else {
              res.send(user);
      }
   } catch(error){
    res.status(400).send("something went wrong")
  }
})

//Feed API - GET /feed - get all the users exists in database
app.get("/feed",async (req,res)=>{
  try{
      const user=await User.find({});
      res.send(user);
  } catch(error){
    console.log(error)
    res.status(400).send("something went wrong")
  }
})

app.post("/signup", async (req,res,next)=>{
 
    const user=new User(req.body);
    try{
     await user.save();
     res.send("user added successfully")
        } catch(err){
      console.log(err);
      res.status(400).send("Error saving user : " + err.message);
    }
});


app.patch("/user/:userId", async (req,res)=>{

  //? marks after params to ensure code do not fail if user id not found
  const userId=req.params?.userId;


  try{
    
  const ALLOWED_UPDATES=["profilePicture","bio","gender","age","skills" ];

  //only allow to update certain things by API we cannot allow email to update once it signup because email and many othe things are very sensitive 
   const updateKeys = Object.keys(req.body);
    const isUpdateAllowed = updateKeys.every(key => ALLOWED_UPDATES.includes(key));

    if (updateKeys.length === 0) {
      return res.status(400).send({ error: "No update fields provided." });
    }
  if(!isUpdateAllowed){
    throw new Error("update not allowed");
  }

    const updatedUser = await User.findByIdAndUpdate(
    userId,
    {$set:req.body},
    {new:true,
    runValidators:true   //to validate data with model on update also if we do not use this then the data validation will only occur
  });                   //at new data or user creation but with this true checks will also happen during update time data 

    if(!updatedUser){
      return res.status(404).send("user not found");
    }
      res.send({
        message:"user updated successfully",
        user: updatedUser
    })    
   } catch(err){
      console.log(err);
      res.status(400).send("update failed! "+err.message)
    }
  })
 
  app.delete("/user",async (req,res)=>{

    const userId=req.body._id;
    try{
    const user=await User.findByIdAndDelete(userId);
      res.send("user deleted successfully");
    }  catch(err){
      console.log(err);
      res.status(500).send("something went wrong")
    }
  })


  

connectDB().then(()=>{

      console.log("database connection established");
      app.listen(3000,()=>{
      console.log("Server is listening on port 3000...")
   })
}).catch((err) => {
console.error("Error connecting to MongoDB:", err);
});

