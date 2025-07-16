const mongoose=require("mongoose");

const userSchema=new mongoose.Schema({
    firstName:{
        type:String
    },
    lastName: {
        type:String
    },
    emailId:  {
        type:String
    },
    password: {
        type:String
    },
    age:      {   
        type:Number
    },
    gender:   {
        type:String
    },


})

const User=mongoose.model("User",userSchema);  //it can take 3rd argument as a collection name you want to store in data that collection name

module.exports={User ,};