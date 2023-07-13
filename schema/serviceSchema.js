const mongoose = require('mongoose')
const validator = require('validator')
require('dotenv').config();

const serviceSchema = new mongoose.Schema({
    fullName:{
        type: String
    },
    companyName:{
        type: String
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
    tag:{
        type: String,
        enum: ['Company', 'Individual'],
        default: "Company"
    },
    industry: {
        type: String
    },
    status:{
        type: String,
        enum: ['Created', 'Released', 'Open', 'Cancelled', 'In process', 'Completed'], //expected values
        default: "Created"
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
}, {versionKey: false, collection:"services"})

const ServiceModel = mongoose.model('services', serviceSchema)
module.exports = { ServiceModel };