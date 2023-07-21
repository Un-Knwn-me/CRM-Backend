var express = require('express');
const { isSignedIn, authorizedUsers, roleAdmin } = require('../config/auth');
const { ContactModel } = require('../schema/contactSchema');
const { SaleModel } = require('../schema/saleSchema');
var router = express.Router();
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

/* GET home page. */
router.get('/list', isSignedIn, async(req, res, next) => {
    try {
        let data = await ContactModel.find({}).sort({ fullName: 1 });
        res.status(200).json({ contacts: data, count: data.length });        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message:"Internal Server Error", error });  
    }
});

// Get contact by id
router.get('/:id', isSignedIn, async(req, res)=>{
    try {
        const { id } = req.params;
        let contact = await ContactModel.findById(id);
        let sales = await SaleModel.findOne({ contactId: id })

        res.status(200).json({ contact, sales });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message:"Internal Server Error", error });
    }
})

// Add new contact
router.post('/add', isSignedIn, authorizedUsers, upload.single("image"), async(req, res, next) => {
    try {
        const existingContact = await ContactModel.findOne({ email: req.body.email });
        console.log(req.body)
        if( !existingContact ) {
            const createdBy = req.user.firstName + " " + req.user.lastName;
            let data = new ContactModel({ ...req.body, image: req.file.originalname, createdBy, updatedBy: "", updatedAt: "" });
            await data.save();        
            res.status(200).json({ message: "Contact added Success" });
        } else {
            console.log(error)
            res.status(401).json({ message: "Contact already existed" });
        }
    } catch ( error) {
        res.status(500).send({ message: "Internal Server Error", error });  
    }
})

// Update contact
router.put('/edit/:id', isSignedIn, authorizedUsers,upload.single("imageName"), async(req, res, next) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        const updatedBy = req.user.firstName + " " + req.user.lastName;

        if (!id || !updatedData) {
            return res.status(404).json({ message: "Bad Request or no Data had passed" });
          }

        let contact = await ContactModel.findById(id);

        if (!contact) {
            return res.status(404).json({ message: "Contact not found" });
          }

          
        contact.fullName = updatedData.fullName || contact.fullName;
        contact.companyName = updatedData.companyName || contact.companyName;
        contact.image = req.file.originalname || contact.image;
        contact.email = updatedData.email || contact.email;
        contact.mobile = updatedData.mobile || contact.mobile;
        contact.jobTitle = updatedData.jobTitle || contact.jobTitle;
        contact.industry = updatedData.industry || contact.industry;
        contact.address = updatedData.address || contact.address;
        contact.city = updatedData.city || contact.city;
        contact.state = updatedData.state || contact.state;
        contact.country = updatedData.country || contact.country;
        contact.pincode = updatedData.pincode || contact.pincode;
        contact.gstin = updatedData.gstin || contact.gstin;
        contact.website = updatedData.website || contact.website;
        contact.tag = updatedData.tag || contact.tag;
        contact.status = updatedData.status || contact.status;
        contact.updatedBy = updatedBy; 
        contact.updatedAt = Date.now();

        await contact.save();
        
        res.status(200).json({message:"Contact updated Success"});
    } catch (error) {
        console.log(error)
        res.status(500).send({message:"Internal Server Error",error});
    }
});

// Delete contact
router.delete('/delete/:id', isSignedIn, roleAdmin, async(req, res)=> {
    try {
        const { id } = req.params;
        const data = await ContactModel.deleteOne({ _id: id });
        res.status(201).json({ message: "Contact deleted successfully" });
    } catch (error) {
        console.log(error);
      res.status(500).send({ message: "Internal Server Error", error });
    }
})

module.exports = router;