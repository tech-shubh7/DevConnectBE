const express=require("express");
const {adminAuth,userAuth}=require("./middlewares/auth");

const app=express();

//this is middleware
app.use("/admin",adminAuth)

//this is request handlers
app.get("/admin/getalldata",(req,res)=>{
      //logic of data fetching
      res.send("all data sent");
})

app.get('/admin/deleteuser',(req,res)=>{
      res.send("Deleted a user")
})

app.get('/user',userAuth,(req,res)=>{
      res.send("user authenticationn successful");
})

//This will only match post method call to the test route in postman
   app.post('/test',(req,res)=>{
      res.send("First save data to db and then log data successfully saved"); 
})

//THis will match only get GET call to /user in the postman not all methods
   app.get(/^\/ab+c$/,(req,res,next)=>{
      console.log(req.query)
      res.send({
            name:"shubh",
            gender:"male",
            age:21,
       })
             next();
   }, 
       (req,res)=>{
         res.send("2nd response here different from 1st")
 })

   app.use('/',(req,res)=>{
      res.send("this .use method will match all http method api call like get post put patch delete"
           +" so whatever method you test in postman it will give same response so use spicifc .get .post app.get app.post method for particular work" )
})


  app.listen(3000,()=>{
    console.log("server is successfully listening on port 3000")
});



