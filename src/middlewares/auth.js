

function adminAuth(req,res,next){
      console.log("Admin auth is getting checked!!!")
      const token="shubhampatel";
      const isAdminAuthorized= token==="shubhampatel";
      if(isAdminAuthorized){
            next();
      } else{
            res.status(401).send("Unauthorized request");
      }
}

function userAuth(req,res,next){
      console.log("User auth is getting checked!!!")
      const token="shubhampatel";
      const isAdminAuthorized= token==="shubhampatel";
      if(isAdminAuthorized){
            next();
      } else{
            res.status(401).send("Unauthorized request");
      }
}

module.exports={
    adminAuth,userAuth,
}