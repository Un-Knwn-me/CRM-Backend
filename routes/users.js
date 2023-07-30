var express = require('express');
var router = express.Router();
const { UserModel } = require('../schema/userSchema');
const { hashCompare, hashPassword, createToken, adminManager, isSignedIn, roleAdmin } = require('../config/auth');
const nodemailer = require('nodemailer');
require('dotenv').config();
const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, path.join(__dirname, "../public/uploads"));
    },
    filename: (req,file,callback) => {
        callback(null, file.originalname);
    }
})

const upload = multer({storage: storage});


let fe_url = "https://crm-zen.netlify.app"

/* GET users listing. */
router.get('/list', isSignedIn, async (req, res)=>{
  try {
    const users = await UserModel.find({}).sort({ firstName: 1 });
      res.status(200).json({ message: "The Users list are:", users, count: users.length });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

// Get user by id
router.get('/:id', isSignedIn, async(req, res)=>{
  try {
      const { id } = req.params;
      let user = await UserModel.findById(id);

      res.status(200).json({ user });
  } catch (error) {
      console.log(error);
      res.status(500).json({ message:"Internal Server Error", error });
  }
})

// signup user
router.post("/signup", upload.single("image"), async (req, res)=>{
  try {
    let user = await UserModel.findOne({email: req.body.email})
    console.log(req.body)
    if(!user){
      req.body.password = await hashPassword(req.body.password);
      let data = new UserModel({ ...req.body, image: req.file.originalname, updatedBy: "", updatedAt: "" });
      await data.save();
      res.status(200).json({message: "User signed up successfully"});
    } else {
      res.status(401).json({message: "User already exists"});
    }    
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal Server Error", error });
  }
})

// signin user
router.post('/signin', async (req, res) => {
  try {
    let user = await UserModel.findOne({email: req.body.email})
      if(user){
          if(await hashCompare(req.body.password, user.password)){
              let token = createToken({ email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, image: user.image })

              res.status(200).send({message: "User successfully logged in", token, role:user.role});
          } else {
              res.status(401).send({message: "Invalid credentials"})
          }
      } else {
          res.status(404).send({message: "User not found"})
      }           
      console.log(user) 
      } catch (error) {
        console.log(error);
      res.status(500).json({ message: "Internal Server Error", error });      
      }
})

// send password reset request via mail
router.post('/forgot-password', async (req, res)=>{
  try {
    let user = await UserModel.findOne({email: req.body.email})
      if(user){
        let token = Math.random().toString(36).slice(-8);
        user.resetlink = token;
        user.resetExpiresAt = Date.now() + 360000 //1hr
        await user.save()

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
      });
 
      const message = {
        from: 'nodemailer@gmail.com',
        to: user.email,
        subject: "password reset request",
        text: `To reset your password, Kindly click on the following link reset your password:
             ${fe_url}/reset-password/${token}
         Kindly ignore the mail if you have not requested a password reset.`
    }

    transporter.sendMail(message, (error, info)=>{
      if(error){
        res.status(404).json({message: "Something went wrong. Please try again."})
      }
      console.log(info.response)
      res.status(200).json({message: "Password reset requested successfully"})
    })

      } else {
          res.status(404).send({message: "User not found"})
      }  
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
})

// Set new password
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // const data = await decodeToken(token);
    const user = await UserModel.findOne({
      resetlink: token,
      resetExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(404).json({ message: "Invalid Token" });
    }

    // Reset the user's password
    user.password = await hashPassword(password);
    user.resetlink = null;
    user.resetExpiresAt = null;

    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

// Add new user
router.post("/add", isSignedIn, adminManager, async (req, res) => {
  try {
    let stud = await UserModel.findOne({ email: req.body.email });
    let stuemail = req.body.email;

    if (!stud) {
      const createdBy = req.user.firstName + ' ' + req.user.lastName;
      let token = Math.random().toString(36).slice(-8); // Initialize token here
      let data = new UserModel({ 
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          password: req.body.password,
          role: req.body.role,
          resetlink: token,
          createdBy,
          resetExpiresAt: Date.now() + 360000 });
      await data.save();

      const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth:{
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASSWORD
          }
      });

      const message = {
        from: process.env.EMAIL_USER,
        to: stuemail,
        subject: "password for zen account",
        text: `Dear ${data.fullName}, 
        The Credential for your Zen account can be set through the following link: 
        ${fe_url}/reset-password/${data.id}/${token}`,
      };

      transporter.sendMail(message, (error, info) => {
        if (error) {
          console.log(error);
          res.status(500).json({ message: "Something went wrong. Please try again." });
        } else {
          console.log(info.response);
          res.status(200).json({ message: "User signed up successfully. Password sent." });
        }
      });
    } else {
      res.status(401).json({ message: "User already exists" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});


// Update user
router.put('/edit/:id', isSignedIn, adminManager, upload.single("image"), async(req, res, next) => {
  try {
      const { id } = req.params;
      const updatedData = req.body;
      console.log(req.body.type)
      const updatedBy = req.user.firstName + " " + req.user.lastName;

      if (!id || !updatedData) {
          return res.status(404).json({ message: "Bad Request or no Data had passed" });
        }

      let user = await UserModel.findById(id);

      if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        if (req.file) {
          user.image = req.file.originalname || user.image;
        } 
      user.role = updatedData.role || user.role;
      user.firstName = updatedData.firstName || user.firstName;
      user.lastName = updatedData.lastName || user.lastName;
      user.email = updatedData.email || user.email;
      user.mobile = updatedData.mobile || user.mobile;
      user.address = updatedData.address || user.address;
      user.city = updatedData.city || user.city;
      user.state = updatedData.state || user.state;
      user.country = updatedData.country || user.country;
      user.pincode = updatedData.pincode ||user.pincode;
      user.updatedBy = updatedBy; 
      user.updatedAt = Date.now();

      await user.save();
      
      res.status(200).json({message:"User updated Success"});
  } catch (error) {
      console.log(error)
      res.status(500).send({message:"Internal Server Error",error});
  }
});

// delete user
router.delete("/delete/:id", isSignedIn, roleAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const data = await UserModel.deleteOne({ _id: id });
    res.status(201).json({ message: "User removed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

module.exports = router;
