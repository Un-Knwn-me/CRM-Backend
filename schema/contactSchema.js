const mongoose = require('mongoose')
require('dotenv').config();

const contactSchema = new mongoose.Schema({
    fullName:{
        type: String
    },
    companyName:{
        type: String
    },
    image:{
        type: String
    },
    email:{
        type: String,
        lowercase: true,
    },
    mobile:{
        type: Number,
        required: true
    },
    jobTitle:{
        type: String
    },
    industry: {
        type: String
    },
    address: {
        type: String
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    country: {
        type: String,
        default: 'India'
    },
    pincode: {
        type: Number,
        required: true
    },
    gstin: {
        type: String
    }, 
    website: {
        type: String,
        trim: true,
        default: ''
      },
    tag:{
        type: String,
        default: ''
    },
    type:{
        type: String,
        enum: ['Individual', 'Company'],
    },
    totalPayment: {
        type: Number,
        default: 0
    },
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Pending'],
        default: 'Pending',
    },
    pendingPayment: {
        type: Number,
        default: 0
    },
    createdBy:{
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now()
    },
    updatedBy:{
        type: String
    },
    updatedAt:{
        type: Date,
        default: Date.now()
    }
}, {versionKey: false, collection:"contacts"})

const ContactModel = mongoose.model('contacts', contactSchema)
module.exports = {ContactModel};