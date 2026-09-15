/*
name,
last_name,
email,
password,
role,
is_active,
is_verified,
loginAttemps,
timeOut
*/
import { Schema, model } from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Admin', 'Operator'],
        default: 'Operator',
        required: true
    },
    is_verified: {
        type: Boolean
    },
    login_attemps: {
        type: Number
    },
    time_out: {
        type: Date
    },
    is_active: {
        type: Boolean,
        default: true
    },
},{
    timestamps: true,
    strict: false
})
export default model ("User", userSchema)