const express = require("express");

const authRouter = express.Router();
const { validateSignupData } = require("../utils/validation.js");
const { User } = require("../models/user.js");
const bcrypt = require("bcrypt");
const validator = require("validator");



authRouter.post("/signup", async (req, res, next) => {

  try {
    //1.validation of data
    validateSignupData(req);

    //2.encrypt the password and store user into database
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashedPassword; //replace the password with hashed password

    //3.create user
    const user = new User(req.body);

    const savedUser = await user.save();

    // 1.create a JWT Token
    const token = await savedUser.getJWT();
    // console.log(token);

    // 2.add the token to cookie and send the response back to user
    res.cookie("token", token,
      { expires: new Date(Date.now() + 8 * 3600000) }
    );

    res.json({
      message: "user added successfully",
      data: savedUser
    });
  } catch (err) {
    console.log(err);
    res.status(400).send("ERROR : " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {

  try {
    const { emailId, password } = req.body;
    if (!validator.isEmail(emailId)) {
      throw new Error("email is not valid!!")
    }
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid credentials")
    }

    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {

      // 1.create a JWT Token
      const token = await user.getJWT();
      // console.log(token);

      // 2.add the token to cookie and send the response back to user
      res.cookie("token", token,
        { expires: new Date(Date.now() + 8 * 3600000) }
      );
      res.send(user)


    } else {
      throw new Error("Invalid credentials");
    }
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

authRouter.post("/logout", async (req, res) => {

  res.cookie("token", null, {
    expires: new Date(Date.now())
  });

  res.send("Logout successful...");


})

module.exports = authRouter;