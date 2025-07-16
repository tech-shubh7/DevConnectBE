const express=require("express");
const {connectDB}=require("./config/database.js");
const app=express();
const {User}=require("./models/user.js");

app.use(express.json());

app.get("/feed",async (req,res)=>{

  try{
       const user=await User.find({emailId:req.body.emailId});
      res.send(user);
   } catch(error){
    res.status(400).send("something went wrong")
  }
})

app.post("/signup", async (req,res,next)=>{
 
      const user=new User(req.body);
     //   const userObj={
      //       firstName:"MS",
      //       lastName:"Dhoni",
      //       emailId:"msd7781@gmail.com",
      //       password:"msd@7781",
      //       gender:"male",
      //       age:44, 
      // }

    //creating a new instance of a user model  
     //const user=new User(userObj);
     console.log(user);
     await user.save().catch((err)=>{
      console.log("error",err);
     });
     res.send("user added successfully")
        
});


connectDB().then(()=>{

      console.log("database connection established");
      app.listen(3000,()=>{
      console.log("Server is listening on port 3000...")
   })
}).catch((err) => {
console.error("Error connecting to MongoDB:", err);
});

