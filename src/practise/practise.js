const express=require("express");
const {adminAuth,userAuth}=require("./middlewares/auth");

const app=express();


app.get("/hithere",(req,res,next)=>{
      next();
},(req,res,next)=>{
      console.log("first handler reacher")
      res.send("hi there");
      next();
},(req,res,next)=>{
      console.log("not reached here control");
    
})

//this is middleware
app.use("/admin",adminAuth)

//this is request handlers
app.get("/admin/getalldata",(err,req,res,next)=>{
 try{
      //logic of data fetching
      res.send("all data sent");

 }  catch(err){
       res.status(500).send("something went wrong");  
   } 
})

app.get('/admin/deleteuser',(req,res)=>{
      res.send("Deleted a user")
})

app.use('/user',userAuth,(req,res,next)=>{
      console.log("user authenticated successfully");
      res.send("user authenticationn successful");
      
})

app.use('/',(err,req,res,next)=>{
        if(err){
            res.status(500).send("something went wrong");
      }
})

//This will only match post method call to the test route in postman
   app.post('/test',(req,res)=>{
      res.send("First save data to db and then log data successfully saved"); 
})

//THis will match only get GET call to /user in the postman not all methods
   app.get(/^\/ab+c$/,(req,res,next)=>{
      console.log(req.query)
      res.send({name:"shubh",gender:"male",age:21, })
             next();
   }, 
       (req,res)=>{
         res.send("2nd response here different from 1st")
 },
   (req,res)=>{
            res.send("3rd response here above is request handler because it does not pass next function if it will pass it will become middleware ")
   })


   app.use('/',(req,res)=>{
      res.send("this .use method will match all http method api call like get post put patch delete"
           +" so whatever method you test in postman it will give same response so use spicifc .get .post app.get app.post method for particular work" )
})




  app.listen(3000,()=>{
    console.log("server is successfully listening on port 3000")
});



