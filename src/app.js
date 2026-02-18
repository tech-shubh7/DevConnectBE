
require('dotenv').config(); // Loads .env variables FIRST
const express=require("express");
const {connectDB}=require("./config/database.js");
const app=express();
const cors=require("cors");
const cookieParser = require("cookie-parser");
const {initializeSocket} = require("./utils/socket.js");
const http=require("http");

 app.use(cors({
    origin: "http://localhost:5173", // Update with your frontend URL
    credentials: true, // Allow cookies to be sent with requests

 }));
 app.use(express.json());
 app.use(cookieParser()); //middleware to parse cookies from request


const authRouter=require("./routes/auth.js")
const profileRouter=require("./routes/profile.js")
const requestRouter=require("./routes/request.js");
const userRouter = require("./routes/user.js");
const forgotPassRouter=require("./routes/forgotpass.js");
const messageRouter=require("./routes/chat.js");

app.use("/",messageRouter);
app.use("/",forgotPassRouter);

app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",requestRouter);
app.use("/",userRouter); 

const server=http.createServer(app);
initializeSocket(server);

connectDB().then(()=>{
    console.log("database connection established");
    server.listen(process.env.PORT ,()=>{
    console.log("Server is listening on port 3000...")
   })
}).catch((err) => {
console.error("Error connecting to MongoDB:", err);
});

