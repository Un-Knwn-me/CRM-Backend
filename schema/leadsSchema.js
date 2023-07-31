const mongoose = require('mongoose')
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
        required: true
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
    type:{
        type: String,
        enum: ['Company', 'Individual']
    },
    industry: {
        type: String
    },
    status:{
        type: String,
        enum: ['New', 'Lost', 'Contacted', 'Canceled', 'Qualified', 'Confirmed']
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