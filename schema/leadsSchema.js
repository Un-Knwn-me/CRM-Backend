const mongoose = require('mongoose')
const validator = require('validator')
require('dotenv').config();

const leadSchema = new mongoose.Schema({
    fullName:{
        type: String,
        required: true
    },
    companyName:{
        type: String,
        required: true
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
        enum: ['New', 'Lost', 'Contacted', 'Canceled', 'Qualified', 'Confirmed'], 
        default: "New"
    },
    description: {
        type: String
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
}, {versionKey: false, collection:"leads"})

const LeadModel = mongoose.model('leads', leadSchema)
module.exports = { LeadModel };