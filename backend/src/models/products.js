/*
code,
type,
description,
unit_of_measure,
minimum_stock,
maximum_stock,
total_stock
is_prepared,
recipe[{
raw_material_id,
}],
required_quantity
*/
import mongoose, { Schema, model } from "mongoose";

//Producto
const productSchema = new Schema({
    code: { type: String, required: true, unique: true },
    type: { type: String, enum: ['Raw Material', 'Finished Good'], required: true },
    description: { type: String, required: true },
    unit_of_measure: { type: String, required: true },
    minimum_stock: { type: Number, default: 0 },
    maximum_stock: { type: Number, default: 0 },
    total_stock: { type: Number, default: 0 },
    // Bill of Materials (BOM) / Recipe logic
    is_prepared: { type: Boolean, default: false },
    recipe: [{
        raw_material_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        required_quantity: { type: Number, required: true }
    }]
},{
    timestamps: true,
    strict: false
})
export default model ("Product", productSchema)