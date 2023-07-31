const mongoose = require('mongoose')
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
        enum: ['Created', 'Released', 'Open', 'Canceled', 'In process', 'Completed']
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
}, {versionKey: false, collection:"services"})

const ServiceModel = mongoose.model('services', serviceSchema)
module.exports = { ServiceModel };