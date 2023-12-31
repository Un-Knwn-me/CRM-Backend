var express = require('express');
const { isSignedIn, authorizedUsers, roleAdmin } = require('../config/auth');
const { ServiceModel } = require('../schema/serviceSchema');
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
router.get('/list',isSignedIn, async(req, res, next) => {
    try {
        let data = await ServiceModel.find({}).sort({ fullName: 1 });
        res.status(200).send({services: data});        
    } catch (error) {
        console.log(error);
        res.status(500).send({message:"Internal Server Error",error});  
    }
});

// Get Service by id
router.get('/:id', isSignedIn, async(req, res)=>{
    try {
        const { id } = req.params;
        let service = await ServiceModel.findById(id);

        res.status(200).json({ service });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message:"Internal Server Error", error });
    }
})

// Book new service
router.post('/add',isSignedIn, authorizedUsers, async(req, res, next) => {
    try {
        const existingService = await ServiceModel.findOne({ email: req.body.email });
        
        if( !existingService ) {
            const createdBy = req.user.firstName + " " + req.user.lastName;
            let data = new ServiceModel({ ...req.body, createdBy, updatedBy: "", updatedAt: "" });
            await data.save();        
            res.status(200).json({ message:"Service Requested Successfully" });
        } else {
            res.status(401).json({ message: "Service already existed" });
        }
    } catch (error) {
        console.log("error")
        res.status(500).send({message:"Internal Server Error",error});  
    }
})

// Update booked service
router.put('/edit/:id', isSignedIn, authorizedUsers, upload.none(), async(req, res, next) => {
    // try {
        const { id } = req.params;
        const updatedData = req.body;
        const updatedBy = req.user.firstName + " " + req.user.lastName;
        console.log(req.body);
        if (!id || !updatedData) {
            return res.status(404).json({ message: "Bad Request or no Data had passed" });
          }

        let service = await ServiceModel.findById(id);
        
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
          }
          
        service.fullName = updatedData.fullName || service.fullName;
        service.companyName = updatedData.companyName || service.companyName;
        service.email = updatedData.email || service.email;
        service.mobile = updatedData.mobile || service.mobile;
        service.address = updatedData.address || service.address;
        service.city = updatedData.city || service.city;
        service.state = updatedData.state || service.state;
        service.country = updatedData.country || service.country;
        service.pincode = updatedData.pincode || service.pincode;
        service.type = updatedData.tag || service.type;
        service.industry = updatedData.industry || service.industry;
        service.description = updatedData.description || service.description;
        service.status = updatedData.status || service.status;
        service.updatedBy = updatedBy; 
        service.updatedAt = Date.now(); 

        await service.save();

        res.status(200).json({message:"Service updated Success"});
    // } catch (error) {
    //     console.log(error)
    //     res.status(500).send({message:"Internal Server Error",error});
    // }
});

// Delete service
router.delete('/delete/:id', isSignedIn, roleAdmin, async(req, res)=> {
    try {
        const { id } = req.params;
        const data = await ServiceModel.deleteOne({ _id: id });
        res.status(201).json({ message: "Service deleted successfully" });
    } catch (error) {
        console.log(error);
      res.status(500).send({ message: "Internal Server Error", error });
    }
})

module.exports = router;
