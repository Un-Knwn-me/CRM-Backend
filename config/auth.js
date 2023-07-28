const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");   

require('dotenv').config();


 const hashPassword = async(password)=>{
  let salt = await bcrypt.genSalt(10);
  let hash = await bcrypt.hash(password, salt);
  return hash;
}

 const hashCompare = (password, hash) =>{
  return bcrypt.compare(password,hash);
}

 const createToken = ({firstName, lastName, email, role, image})=>{
  let token = jwt.sign({firstName, lastName, email, role, image}, process.env.SecretKey, {expiresIn: "60m"});
  return token;
}

const decodeToken = (token) => {
  let data = jwt.verify(token, process.env.SecretKey);
  return data;
};


 const isSignedIn = async (req, res, next) => {
    try {
      if (req.headers.authorization) {
      let token = req.headers.authorization.split(' ')[1];
      let data = decodeToken(token);
      req.user = { firstName: data.firstName, lastName: data.lastName };
      if((Math.floor(Date.now()/1000))<= data.exp){
        next();
      } else {
        return res.status(401).json({ message: "Login Expired" });  
      } 
     } else {
     return res.status(400).json({ message: "Access denied" });
}
    }
     catch (error) {
      return res.status(500).json({ message: "Invalid Authentication" });
    }
};

 const roleAdmin = async(req, res, next)=>{
    try {
      if (req.headers.authorization) {
      let token = req.headers.authorization.split(' ')[1];
      let data = decodeToken(token);
      if(data.role === "Admin"){
        next();
      } else {
        return res.status(401).json({ message: "Admin only" });  
      } 
    }
  } catch (error) {
    return res.status(500).json({ message: "Invalid Authentication" });
  }
}
const roleManager = async(req,res, next)=>{
    try {
        if (req.headers.authorization) {
            let token = req.headers.authorization.split(' ')[1];
            let data = decodeToken(token);
            if(data.role === "Manager"){
              next();
            } else {
              return res.status(401).json({ message: "Manager only" });  
            } 
          }
    } catch (error) {
        return res.status(500).json({ message: "Invalid Authentication" }); 
    }
}

const adminManager = async(req, res, next)=>{
    try {
        if (req.headers.authorization) {
            let token = req.headers.authorization.split(' ')[1];
            let data = decodeToken(token);
            if((data.role === "Manager") || (data.role === "Admin")){
              next();
            } else {
              return res.status(401).json({ message: "Manager only" });  
            } 
          }        
    } catch (error) {
        return res.status(500).json({ message: "Invalid Authentication" });
    }
}

const authorizedUsers = async(req, res, next) => {
    try {
        if (req.headers.authorization) {
            let token = req.headers.authorization.split(' ')[1];
            let data = decodeToken(token);
            if(data.role != "User"){
              next();
            } else {
              return res.status(401).json({ message: "Authorized User only" });  
            } 
          }
    } catch (error) {
        return res.status(500).json({ message: "Invalid Authentication" });
    }
}

module.exports = {hashCompare, hashPassword, createToken, decodeToken, isSignedIn, roleAdmin, authorizedUsers, roleManager, adminManager}