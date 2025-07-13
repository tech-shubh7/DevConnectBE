const mongoose=require("mongoose");


async function connectDB() {

 try{
    await mongoose.connect("mongodb://127.0.0.1:27017/DevTinder");
    
    // console.log("Connected to MongoDB");
    // const db=mongoose.connection;
    // const collection=db.collection("users");

    // await collection.insertOne({name:"shubh",age:22,gender:"male"})
    // console.log("Data inserted successfully");

    // const result = await collection.deleteMany({name:"shubh"});
    // console.log("deleted documents = ", result.deletedCount);

  } catch(err){
      console.log("error while running code",err);
   }
}

 



module.exports={connectDB,}