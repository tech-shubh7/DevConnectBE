const express=require("express");
const profileRouter=express.Router();
const {userAuth}=require("../middlewares/auth");
const {User}=require("../models/user.js");
const { validateEditProfileData } = require("../utils/validation.js");
const bcrypt = require("bcrypt");



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

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Check for required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both current and new passwords are required." });
    }
   const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,32}$/;
    if (!strongPasswordRegex.test(newPassword)) {
      return res.status(400).json({ message: "Weak password." });
    }

    if (currentPassword === newPassword) {
  return res.status(400).json({ message: "New password must be different from the current password." });
}


    // Get user object from req.user (already populated by userAuth)
    const user = req.user;

    // Compare current password with hashed password in DB
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password in DB
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    res.status(400).send("Error updating password:"+err.message);
  
  }
});


module.exports=profileRouter;