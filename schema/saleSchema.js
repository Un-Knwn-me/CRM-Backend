const mongoose = require('mongoose')
const validator = require('validator');
require('dotenv').config();

const saleSchema = new mongoose.Schema({
    contactId: {
        type: String,
        required: true,
    },
    contactName: {
        type: String,
    },
    amount: {
        type: Number,
        required: true,
    },
    productName: {
        type: String,
    },
    productType: {
        type: String
    },
    quantity: {
        type: String,
    },
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Pending'],
        default: 'Pending',
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
}, {versionKey: false, collection:"sales"})

const SaleModel = mongoose.model('sales', saleSchema)
module.exports = { SaleModel };