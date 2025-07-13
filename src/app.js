const express=require("express");
const {connectDB}=require("./config/database.js");
const app=express();
const {User}=require("./models/user.js");


app.post("/signup", async (req,res,next)=>{
        const userObj={
            firstName:"sam",
            lastName:"diwan",
            emailId:"sami8@gmail.com",
            password:"sami@123",
            gender:"female",
            age:21, 
      }

      //creating a new instance of a user model  
      const user=new User(userObj);
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

