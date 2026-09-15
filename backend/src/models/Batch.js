/*
product_id,
entry_date,
initial_quantity,
available_quantity,
unit_cost,
status
*/

import mongoose, { Schema, model } from "mongoose";

//Lote
const batchSchema = new Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    entry_date: { type: Date, default: Date.now },
    initial_quantity: { type: Number, required: true },
    available_quantity: { type: Number, required: true },
    unit_cost: { type: Number, required: true },
    status: { type: String, enum: ['Active', 'Depleted'], default: 'Active' }
}, {
    timestamps: true,
    strict: false
})
export default model("Batch", batchSchema)