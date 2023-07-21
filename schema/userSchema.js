const mongoose = require('mongoose')
const validator = require('validator')
require('dotenv').config();

const userSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: true
    },
    email:{
        type: String,
        lowercase: true,
        required: true,
        validate:(value)=>validator.isEmail(value)
    },
    password:{
        type: String
    },
    image:{
        type: String
    },
    mobile:{
        type: Number
    },
    address: {
        type: String
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    country: {
        type: String
    },
    pincode: {
        type: Number
    },
    resetlink:{
        type: String,
        default: ''
    },
    resetExpiresAt:{
        type: Date,
        default:''
    },
    token:{
        type: String,
        default: ''
    },
    role:{
        type: String,
        enum: ['Admin', 'User', 'Manager', 'Employee'],
        default: "Admin"
    },
    createdAt:{
        type: Date,
        default: Date.now()
    },
    createdBy:{
        type: String
    },
    updatedBy:{
        type: String
    },
    updatedAt:{
        type: Date,
        default: Date.now()
    }
}, {versionKey: false, collection:"user"})

const UserModel = mongoose.model('user', userSchema)
module.exports = { UserModel };