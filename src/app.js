const express=require("express");

const app=express();


//This will only match post method call to the test route in postman
app.post('/test',(req,res)=>{
      res.send("First save data to db and then log data successfully saved"); 
})

//THis will match only get GET call to /user in the postman not all methods
app.get(/^\/ab+c$/,(req,res)=>{
      // console.log(req.query)
      res.send({
            name:"shubh",
            gender:"male",
            age:21,
      } )

})

app.use('/',(req,res)=>{
      res.send("this .use method will match all http method api call like get post put patch delete"
           +" so whatever method you test in postman it will give same response so use spicifc .get .post app.get app.post method for particular work" 
      )
})


app.listen(3000,()=>{
    console.log("server is successfully listening on port 3000")
});






































