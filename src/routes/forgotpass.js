const sendOtpViaEmail = require("../utils/genAndSendOtp.js");
const express = require("express");
const forgotPassRouter = express.Router();
const { User } = require("../models/user.js");
const bcrypt = require("bcrypt");


forgotPassRouter.post("/sendotp", async (req, res) => {
  try {
    const { emailId: email } = req.body;
    const result = await sendOtpViaEmail(email);

    if (!result.userFound) {
      return res.json({
        message: "If an account with this email exists, an OTP has been sent.",
      });
    }

    if (!result.success) {
      return res.status(500).json({ message: "Failed to send OTP." });
    }

    // TODO: hash result.otp and save to DB (user.resetOTP)
    res.json({ message: "OTP sent successfully." });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

forgotPassRouter.post("/verifyotp", async (req, res) => {
  try {
    const { emailId: email, otp } = req.body;
    const user = await User.findOne({ emailId: email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email." });
    }
    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: "No OTP found. Please generate a new one." });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: "OTP has expired. Please generate a new one." });
    }
    const isOtpValid = await bcrypt.compare(otp, user.otp);

    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // OTP is valid
    // Clear OTP and expiry after successful verification
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    // OTP is valid
    // 1.create a JWT Token
    const token = await user.getJWT();
    // console.log(token);

    // 2.add the token to cookie and send the response back to user
    res.cookie("token", token,
      { expires: new Date(Date.now() + 8 * 3600000) }
    );
    res.json({
      success: true,
      user: user
    })

  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

module.exports = forgotPassRouter;