const express=require("express");
const profileRouter=express.Router();
const {userAuth}=require("../middlewares/auth");
const {User}=require("../models/user.js");
const { validateEditProfileData } = require("../utils/validation.js");



profileRouter.get("/profile/view",userAuth, async (req,res)=>{

try{
    const user=req.user; //user is attached to req object by userAuth middleware
    res.send(user);

  }  catch(err){
    res.status(400).send("ERROR : " + err.message);
  }
})


profileRouter.patch("/profile/edit",userAuth, async (req,res)=>{
  try{
    if(!validateEditProfileData(req)){
      return res.status(400).send("Invalid edit request");
    }

    const loggedInUser=req.user;
    
    Object.keys(req.body).forEach((key)=>(
      loggedInUser[key]=req.body[key]
    ));

    await loggedInUser.save();

    res.json({
      message : `${loggedInUser.firstName}, Your Profile updated successfully`,
      data : loggedInUser
    });

  } catch(err){
    res.status(400).send("ERROR : "+err.message);
  }
  
 
});

profileRouter.patch("/profile/password",userAuth,async (req,res)=>{

  //making forget password or edit password api
  try{
    const loggedInUser=req.user;
    const {oldPassword,newPassword}=req.body;

    if(!oldPassword || !newPassword){
      return res.status(400).send("Please provide old and new password");
    }

    const isMatch=await loggedInUser.comparePassword(oldPassword);
    if(!isMatch){
      return res.status(400).send("Old password is incorrect");
    }

    loggedInUser.password=newPassword;
    await loggedInUser.save();

    res.json({
      message : "Your Password updated successfully",
      data : loggedInUser
    });

  } catch(err){
    res.status(400).send("ERROR : "+err.message);
  }
  
})

module.exports=profileRouter;