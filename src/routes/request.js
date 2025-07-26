const express = require('express');
const requestRouter = express.Router();
const { userAuth } = require('../middlewares/auth');
const { User } = require('../models/user.js');




requestRouter.post("/sendConnectionRequest",userAuth, async (req,res)=>{

  const user=req.user;
  try{  
      console.log("sending connection request to user");
      res.send(user.firstName+" sent the connection request!");
  }
  catch(err){
    res.status(400).send("ERROR : " + err.message);
  }
});

module.exports=requestRouter;