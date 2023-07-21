var express = require('express');
const { isSignedIn, authorizedUsers, roleAdmin } = require('../config/auth');
const { LeadModel } = require('../schema/leadsSchema');
var router = express.Router();

/* GET home page. */
router.get('/list', isSignedIn, async(req, res, next) => {
    try {
        let data = await LeadModel.find({}).sort({ fullName: 1 });
        res.status(200).send({ leads: data, count: data.length });        
    } catch (error) {
        console.log(error);
        res.status(500).send({message:"Internal Server Error",error});  
    }
});

// Get lead by id
router.get('/:id', isSignedIn, async(req, res)=>{
    try {
        const { id } = req.params;
        let data = await LeadModel.findById(id);

        res.status(200).json({ leads: data });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message:"Internal Server Error", error });
    }
})

// Get leads based on status
router.get('/status/:status', isSignedIn, async(req, res)=>{
    try {
        const { status } = req.params;
        let data = await LeadModel.find({status}).sort({ fullName: 1 });

        res.status(200).json({ leads: data, count: data.length });
    } catch (error) {
        console.log(error);
        res.status(500).send({message:"Internal Server Error",error});
    }
})


// Genrate a new lead
router.post('/add',isSignedIn, authorizedUsers, async(req, res, next) => {
    try {
        const existingLead = await LeadModel.findOne({ email: req.body.email });

        if( !existingLead ) {
            const createdBy = req.user.firstName + " " + req.user.lastName;
            let data = new LeadModel({ ...req.body, createdBy, updatedBy: "", updatedAt: "" });
            await data.save();        
            res.status(200).json({ message: "Lead Genrated Successfully" });
        } else {
            res.status(401).json({ message: "Lead already existed" });
        }
    } catch (error) {
        res.status(500).send({message:"Internal Server Error",error});  
    }
})

// Update a lead
router.put('/edit/:id',isSignedIn, authorizedUsers, async(req, res, next) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        const updatedBy = req.user.firstName + " " + req.user.lastName;

        if (!id || !updatedData) {
            return res.status(404).json({ message: "Bad Request or no Data had passed" });
          }

        let lead = await LeadModel.findById(id);

        if (!lead) {
            return res.status(404).json({ message: "Lead not found" });
          }

          
        lead.fullName = updatedData.fullName || lead.fullName;
        lead.companyName = updatedData.companyName || lead.companyName;
        lead.email = updatedData.email || lead.email;
        lead.mobile = updatedData.mobile || lead.mobile;
        lead.address = updatedData.address || lead.address;
        lead.city = updatedData.city || lead.city;
        lead.state = updatedData.state || lead.state;
        lead.country = updatedData.country || lead.country;
        lead.pincode = updatedData.pincode || lead.pincode;
        lead.tag = updatedData.tag || lead.tag;
        lead.website = updatedData.website || lead.website;
        lead.status = updatedData.status || lead.status;
        lead.updatedBy = updatedBy; 
        lead.updatedAt = Date.now(); 

        await lead.save();
        
        res.status(200).json({message:"Lead updated Success"});
    } catch (error) {
        console.log(error)
        res.status(500).send({message:"Internal Server Error",error});
    }
});

// Delete lead
router.delete('/delete/:id', isSignedIn, roleAdmin, async(req, res)=> {
    try {
        const { id } = req.params;
        const data = await LeadModel.deleteOne({ _id: id });
        res.status(201).json({ message: "Lead deleted successfully" });
    } catch (error) {
        console.log(error);
      res.status(500).send({ message: "Internal Server Error", error });
    }
})

module.exports = router;
