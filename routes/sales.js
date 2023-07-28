var express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer');
const { isSignedIn, authorizedUsers } = require('../config/auth');
const { SaleModel } = require('../schema/saleSchema');
const { ContactModel } = require('../schema/contactSchema');
var router = express.Router();


// Get all sales history
router.get('/list', isSignedIn, async(req, res)=> {
    try {
        let data = await SaleModel.find({}).sort({ createdAt: 1 });
        const totalAmount = data.reduce((sum, sale) => sum + sale.amount, 0);

        let pending = await ContactModel.find({});
        const pendingAmount = pending.reduce((sum, pending) => sum + pending.pendingPayment, 0);

        res.status(200).json({ sales: data, count: data.length, totalAmount, pendingAmount });
    } catch (error) {
        console.log(error);
        res.status(500).send({message:"Internal Server Error",error});  
    }
});

// Get data based on month
router.get('/list/:year/:month', isSignedIn, async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const data = await SaleModel.find({ createdAt: { $gte: startDate, $lte: endDate } }).sort({ fullName: 1 });
    const totalAmount = data.reduce((sum, sale) => sum + sale.amount, 0);
    
    res.status(200).json({ sales: data, count: data.length, totalAmount });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error", error });
  }
});

// Get data based on year
router.get('/list/:year', isSignedIn, async (req, res) => {
  try {
    const { year } = req.params;
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 12 -1, 31);

    const data = await SaleModel.find({ createdAt: { $gte: startDate, $lte: endDate } }).sort({ fullName: 1 });
    const totalAmount = data.reduce((sum, lead) => sum + lead.amount, 0);

    res.status(200).json({ sales: data, count: data.length, totalAmount });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error", error });
  }
});


// Get sales history of a contact
router.get('/salesHistory/:contactId',isSignedIn, async(req, res, next) => {
    try {
        const {contactId} = req.params;

        const contact = await ContactModel.findById(contactId);
        if (!contact) {
            return res.status(404).json({message: 'Contact not found'});
        }

        const sales = await SaleModel.find({contactId: contactId}).sort({ createdAt: 1 });
        const totalAmount = sales.reduce((sum, sale) => sum + sale.amount, 0);
        res.status(200).send({ sales, count: sales.length, totalAmount });        
    } catch (error) {
        console.log(error);
        res.status(500).send({message:"Internal Server Error",error});  
    }
});

// Genrate new sale
router.post('/add', isSignedIn, authorizedUsers, async (req, res, next) => {
    try {
      const { firstName, lastName } = req.user;
      const createdBy = `${firstName} ${lastName}`;
      const { contactId, amount, paymentStatus } = req.body;
  
      // Verifying Contact 
      const contact = await ContactModel.findById(contactId);
      const contactName = contact.fullName;
      if (!contact) {
        return res.status(404).json({ message: 'Contact not found, add contact' });
      }
  
      // Generating Sales
      let sale = new SaleModel({ ...req.body, contactId, contactName, amount, paymentStatus, createdBy, updatedBy: '', updatedAt: '' });
      await sale.save();
  
      // Update the pending payment in the contact
      if (sale.paymentStatus === 'Pending') {
        contact.pendingPayment += sale.amount;
        contact.totalPayment += sale.amount; 
      }
  
      await contact.save(); 
  
      res.status(200).json({ message: 'Sales Generated Successfully', sale });
    } catch (error) {
      res.status(500).send({ message: 'Internal Server Error', error });
    }
  });
  
  
// Get total pending payment
router.get('/pendingPayments',isSignedIn, async(req, res, next) => {
   try {
    let data = await ContactModel.find({ pendingPayment: { $ne: 0 } })
    let sales = await SaleModel.find({}).sort({ createdAt: 1 });
    const totalAmount = data.reduce((sum, sale) => sum + sale.pendingPayment, 0);
    res.status(200).json({ data: data, count: data.length, totalAmount });
} catch (error) {
    console.log(error);
    res.status(500).send({message:"Internal Server Error",error});  
}
});

// Update payment
router.put('/updatePayment/:id', isSignedIn, async(req, res, next) => {
    try {
        const { firstName, lastName } = req.user;
      const updatedBy = `${firstName} ${lastName}`;
      const { contactId, paymentAmount } = req.body;
      const { id } = req.params;

        // find the contact details
        const contact = await ContactModel.findById(contactId);
        if (!contact) {
            return res.status(404).json({message: 'Contact not found'});
        }

        // find the sale details
    const sale = await SaleModel.findOne({ _id: id });
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

        // Update payment status
        sale.paymentStatus = "Paid";
        sale.pendingPayment -= paymentAmount;
        contact.pendingPayment -= paymentAmount;

        await sale.save();
        await contact.save();

        res.status(200).json({ message: 'Payment details updated successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).send({message:"Internal Server Error",error});          
    }
})

// Send Payment remainder via email to contact
router.post('/remainder/:contactId',isSignedIn, async(req, res, next) => {
    try {
        const {contactId} = req.params;

        const contact = await ContactModel.findById(contactId);
        if (!contact) {
            return res.status(404).json({message: 'Contact not found'});
        }

        // Sending remainder via nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth:{
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
   
        // message content
        const message = {
          from: 'nodemailer@gmail.com',
          to: contact.email,
          subject: "Payment Remainder",
          text: `
          This is the Payment remainder for ${contact.fullName}
          Kindly do the following payment Rs.${contact.pendingPayment} as soon as possible.
          `
      }
  
    //   transporter
      transporter.sendMail(message, (error, info)=>{
        if(error){
            console.log(error);
          res.status(404).json({message: "Something went wrong. Please try again."});
        }
        console.log(info.response)
        res.status(200).json({message: "Payment remainder sent successfully"})
      })
    } catch (error) {
        console.log(error);
        res.status(500).send({message:"Internal Server Error",error});  
    }
});


// // Send Payment remainder via whatsapp
// router.post('/sendWhatsapp/:contactId', async (req, res) => {
//     try {
//       const { contactId } = req.params;
  
//         const contact = await ContactModel.findById(contactId);
//         if (!contact) {
//             return res.status(404).json({message: 'Contact not found'});
//         }
 
//       // Send notification via WhatsApp webhook
//       const webhookUrl = 'https://graph.facebook.com/v17.0/105773772576309';
//       const message = `Payment details updated:\n\nContact: ${contact.fullName}\n Your Pending Payment: ${contact.pendingPayment}, Kindly pay as soon as possible.`;
//       const payload = {
//         to: `${contact.mobile}`, // Replace with the actual WhatsApp number
//         message: message,
//       };
  
//       await axios.post(webhookUrl, payload);
  
//       res.status(200).json({ message: 'Payment details updated successfully' });
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({ message: 'Internal Server Error', error });
//     }
//   });
  

module.exports = router;
