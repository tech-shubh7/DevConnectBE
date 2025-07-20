const mongoose=require("mongoose");
//validator is used to validate the data before saving it to database
//it is used to validate email, url, password, etc.
//rather than defining validate function in each field we can use validator package
const validator=require("validator");


const userSchema=new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        minLength:3,
        maxLength:20,
        trim:true, //to remove extra spaces from start and end
    },
    lastName: {
        type:String,
         minLength:3,
        maxLength:20,
        trim:true, //to remove extra spaces from start and end
    },
    emailId:  {
        type:String,
        lowercase:true,
        required:true,
        unique:true, //to ensure no duplicate emailId
        trim:true,
        validate(value){
        if(!validator.isEmail(value)){
            throw new Error("Email is not valid");
        }
    }         
},
    password: {
        type:String,
        required:true,
        minLength:8,
        maxLength:32,
          validate(value){
            // At least one uppercase, one lowercase, one digit, one special char
            const regex= /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,32}$/;
            if(!regex.test(value)){
                throw new Error("Password must be 8-32 characters and include uppercase, lowercase, number, and special character.");
            }
          }
    },
    age:  {   
        type:Number,
        min: [18, "Age must be 18 or older"], //to ensure age is at least 18
    //     validate(value){
    //         if(value<18){
    //             throw new Error("Age must be 18 or older");
    //       }
    //    }
    },
    gender:   {
        type:String,
        validate(value){
            if(!["male","female"].includes(value)){
          throw new Error("Gender data is not valid");
            }
        }
    },
    profilePicture: {
        type:String,
        trim:true,
        default:"https://www.w3schools.com/howto/img_avatar.png", //to set default value to empty string
        validate(value){
            if(!validator.isURL(value)){
                throw new Error("Profile picture URL is not valid");
            }
        }
//     validator: function (value) {
//       // Basic URL regex check (simplified, not overly strict)
//       return /^(https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*|\/[\w\-./]+)$/.test(value);
 
//     },
//     message: props => `${props.value} is not a valid URL for profile picture`
//   }
},
    bio:      {
        type:String,
        trim:true, //to remove extra spaces from start and end
        default:"This is a default bio of the user!!", //to set default value to empty string
         maxLength:500, //to limit the length of bio to 200 characters 
    //     validate(value){
    //         if(value.length>500){
    //             throw new Error("Bio cannot be more than 500 characters");
    //         }                                                
    // } 
},    
    skills:    {
        type:[String],
        validate(value){
            if(value.length>10){
                throw new Error("You can only add up to 10 skills");
            }
        }
    },

},{
    timestamps:true, //to add createdAt and updatedAt fields automatically
})

const User=mongoose.model("User",userSchema);  //it can take 3rd argument as a collection name you want to store in data that collection name

module.exports={User,};