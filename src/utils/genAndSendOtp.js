// utils/sendOtpViaEmail.js
const nodemailer = require("nodemailer");
const { User } = require("../models/user");
const bcrypt = require("bcrypt");  // ✅ Correct - default import

// Pure utility function – returns info to controller, does not send HTTP responses
async function sendOtpViaEmail(email) {
  try {
    console.log(email);

    // 1️⃣ Input validation
    if (!email) {
      throw new Error("Email is required");
    }

    // 2️⃣ Check if user exists
    const user = await User.findOne({ emailId: email });
    console.log(user);

    if (!user) {
      // Return neutral result – controller will handle response
      return { userFound: false };
    }

    // 3️⃣ Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    //hash otp
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Set OTP and expiry (5 minutes from now)
    user.otp = hashedOtp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await user.save();
    console.log(`Generated OTP for ${email}: ${otp}`);

    // 4️⃣ Configure email transporter (SMTP setup)
    //    In production, credentials come from .env for security
    const transporter = nodemailer.createTransport({
      service: "gmail", // or use: host, port, secure for custom SMTP
      auth: {
        user: process.env.EMAIL_USER, // your Gmail / SMTP email
        pass: process.env.EMAIL_PASS, // your app password (not regular password)
      },
    });

    // 5️⃣ Define mail details
    const mailOptions = {
      from: `"MyApp Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP",
      html: `<p>Your OTP for password reset on <strong>DevConnect</strong> is <strong>${otp}</strong>.</p> It will expire in 5 minutes.`,
    };

    // 6️⃣ Send the email
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP ${otp} sent to ${email}`);
    // 7️⃣ Return results to controller
    return {
      userFound: true,
      otp,
      success: true,
    };
  } catch (err) {
    console.error("Error sending OTP email:", err.message);
    return {
      success: false,
      message: err.message,
    };
  }
}

module.exports = sendOtpViaEmail;
