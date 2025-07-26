const jwt=require("jsonwebtoken");
const { User } = require("../models/user");

async function userAuth(req,res,next){
      //read the token from the req cookies
      //validate the token'
      //find the user
 try{     
      const cookies=req.cookies;

      const {token}=req.cookies;
      if(!token){
            throw new Error("Invalid token")
      }

      const decodedObj=await jwt.verify(token,"DEV@Connect786");
      const {_id}=decodedObj;

      const user=await User.findById(_id);
      if(!user){
            throw new Error("user not found");
      }


      req.user=user; //attach the user to the request object

      next();
    }  catch(err){
      res.status(400).send("ERROR : " + err.message);
    }
}

module.exports={
    userAuth,
}