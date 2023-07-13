const mongoose = require('mongoose')
const validator = require('validator');
require('dotenv').config();

const contactSchema = new mongoose.Schema({
    fullName:{
        type: String
    },
    companyName:{
        type: String
    },
    image:{
        data: Buffer,
        contentType: String
    },
    email:{
        type: String,
        lowercase: true,
        required: true,
        validate:(value)=>validator.isEmail(value)
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
        validate:(value)=>validator.isURL(value, {protocols: ['http', 'https']})
    },
    tag:{
        type: String,
        default: ''
    },
    status:{
        type: String,
        enum: ['Individual', 'Company'],
        default: "Individual"
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