const mongoose = require("mongoose");
//validator is used to validate the data before saving it to database
//it is used to validate email, url, password, etc.
//rather than defining validate function in each field we can use validator package
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")


const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 20,
        trim: true, //to remove extra spaces from start and end
    },
    lastName: {
        type: String,
        minLength: 3,
        maxLength: 20,
        trim: true, //to remove extra spaces from start and end
    },
    emailId: {
        type: String,
        lowercase: true,
        required: true,
        unique: true, //to ensure no duplicate emailId
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Email is not valid");
            }
        }
    },
    password: {
        type: String,
        required: true,

    },
    age: {
        type: Number,
        min: [18, "Age must be 18 or older"], //to ensure age is at least 18
        //     validate(value){
        //         if(value<18){
        //             throw new Error("Age must be 18 or older");
        //       }
        //    }
    },
    gender: {
        type: String,
        validate(value) {
            if (!["male", "female"].includes(value)) {
                throw new Error("Gender data is not valid");
            }
        }
    },
    profilePicture: {
        type: String,
        trim: true,
        default: "https://www.w3schools.com/howto/img_avatar.png", //to set default value to empty string
        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error("Profile picture URL is not valid");
            }
        }

    },
    bio: {
        type: String,
        trim: true, //to remove extra spaces from start and end
        default: "This is a default bio of the user!!", //to set default value to empty string
        maxLength: 500, //to limit the length of bio to 200 characters 

    },
    skills: {
        type: [String],
        validate(value) {
            if (value.length > 10) {
                throw new Error("You can only add up to 10 skills");
            }
        }
    },
    otp: {
        type: String,
        default: null  // null when no OTP is active
    },
    otpExpiry: {
        type: Date,
        default: null  // null when no OTP is active
    }
},
    {
        timestamps: true, //to add createdAt and updatedAt fields automatically
    });



userSchema.methods.getJWT = async function () {
    const user = this;
    const token = await jwt.sign({ _id: user._id }, "DEV@Connect786",
        { expiresIn: '1d' });

    return token;
}

userSchema.methods.validatePassword = async function (passwordInputByUser) {
    const user = this;
    const pasaswordHash = user.password;

    const isPasswordValid = await bcrypt.compare(
        passwordInputByUser,
        pasaswordHash
    );

    return isPasswordValid;
}

const User = mongoose.models.User || mongoose.model("User", userSchema);  //it can take 3rd argument as a collection name you want to store in data that collection name

module.exports = { User, };