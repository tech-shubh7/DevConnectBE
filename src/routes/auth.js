const express = require("express");

const authRouter = express.Router();
const { validateSignupData } = require("../utils/validation.js");
const { User } = require("../models/user.js");
const bcrypt = require("bcrypt");
const validator = require("validator");
const axios = require("axios");

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

});

authRouter.get("/auth/github", (req, res) => {

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email`;

  res.redirect(githubAuthUrl);
});

authRouter.get("/auth/github/callback", async (req, res) => {

  const code = req.query.code;

  try {
    // 1. Exchange code for access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    console.log(tokenResponse.data, "<<<tokenresponse.data");
    console.log(accessToken, "<<accesstoken");

    if (!accessToken) {
      throw new Error("Failed to get access token from GitHub");
    }

    // 2. Fetch user profile from GitHub
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log(userResponse, "<<<<<<github/user")

    const githubUser = userResponse.data;

    // 3. Fetch email (may be private)
    const emailResponse = await axios.get("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log(emailResponse, "<<<email")
    const primaryEmail = emailResponse.data.find(
      (e) => e.primary && e.verified
    );
    console.log(primaryEmail, "<<<primaryemail")
    const email = primaryEmail ? primaryEmail.email : githubUser.email;

    if (!email) {
      throw new Error("Unable to retrieve email from GitHub");
    }

    // 4. Find or create user in DB
    let user = await User.findOne({ emailId: email });

    if (!user) {
      user = new User({
        firstName: githubUser.name ? githubUser.name.split(" ")[0] : githubUser.login,
        lastName: githubUser.name ? githubUser.name.split(" ").slice(1).join(" ") : "",
        emailId: email,
        profilePicture: githubUser.avatar_url,
      });
      await user.save();
    }

    // 5. Generate JWT and set cookie
    const token = await user.getJWT();
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
      httpOnly: true,
      sameSite: "lax"
    });

    // 6. Redirect to frontend
    res.redirect(process.env.FRONTEND_URL || "http://localhost:5173");

  } catch (err) {
    console.log(err);
    res.status(400).send("ERROR : " + err.message);
  }
});

module.exports = authRouter;