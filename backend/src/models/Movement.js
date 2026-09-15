/*
product_id,
batch_id,
user_id,
movement_type,
quantity,
reason,
movement_date
*/
import mongoose, { Schema, model } from "mongoose";

const movementSchema = new Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    batch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    movement_type: {
        type: String,
        enum: ['In', 'Out', 'Adjustment'],
        required: true
    },
    quantity: { type: Number, required: true },
    reason: { type: String, required: true },
    movement_date: { type: Date, default: Date.now }

}, {
    timestamps: true,
    strict: false
})
export default model ("Movement", movementSchema)