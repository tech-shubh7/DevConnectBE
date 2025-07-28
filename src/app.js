const express=require("express");
const {connectDB}=require("./config/database.js");
const app=express();

const cookieParser = require("cookie-parser");

const {userAuth}=require("../src/middlewares/auth")

 app.use(express.json());
 app.use(cookieParser()); //middleware to parse cookies from request

const authRouter=require("./routes/auth.js")
const profileRouter=require("./routes/profile.js")
const requestRouter=require("./routes/request.js");
const userRouter = require("./routes/user.js");

app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",requestRouter);
app.use("/",userRouter);

connectDB().then(()=>{
    console.log("database connection established");
    app.listen(3000,()=>{
    console.log("Server is listening on port 3000...")
   })
}).catch((err) => {
console.error("Error connecting to MongoDB:", err);
});

