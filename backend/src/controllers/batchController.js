import mongoose from "mongoose";
import batchModel from "../models/Batch.js";
import movementModel from "../models/Movement.js";
import productModel from "../models/products.js";

const batchController = {};

batchController.create = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    //#1 solicitar los datos de la entrada
    const { product_id, quantity, unit_cost, reason } = req.body;

    //#2 buscar el producto
    const product = await productModel.findById(product_id);
    if (!product || product.is_active === false) {
      return res.status(404).json({ message: "Product not found" });
    }

    //#3 iniciar la transaccion
    session.startTransaction();

    //#4 crear el lote de entrada (PEPS: cada lote conserva su propio costo unitario)
    const newBatch = new batchModel({
      product_id,
      initial_quantity: quantity,
      available_quantity: quantity,
      unit_cost,
      status: "Active",
    });
    await newBatch.save({ session });

    //#5 registrar el movimiento de entrada
    const newMovement = new movementModel({
      product_id,
      batch_id: newBatch._id,
      user_id: req.user.id,
      movement_type: "In",
      quantity,
      reason,
    });
    await newMovement.save({ session });

    //#6 actualizar el stock total del producto
    product.total_stock += quantity;
    await product.save({ session });

    //#7 confirmar la transaccion
    await session.commitTransaction();

    //#8 responder al cliente
    return res.status(201).json({ message: "Batch registered successfully", batch: newBatch });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    session.endSession();
  }
};

batchController.getAll = async (req, res) => {
  try {
    //#1 obtener filtros opcionales de la query
    const { product_id, status } = req.query;

    //#2 construir el filtro de busqueda
    const filter = {};
    if (product_id) filter.product_id = product_id;
    if (status) filter.status = status;

    //#3 buscar los lotes ordenados por fecha de entrada (orden PEPS)
    const batches = await batchModel.find(filter).sort({ entry_date: 1 });

    //#4 responder al cliente
    return res.status(200).json(batches);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

batchController.getById = async (req, res) => {
  try {
    //#1 obtener el id del lote
    const { id } = req.params;

    //#2 buscar el lote
    const batch = await batchModel
      .findById(id)
      .populate("product_id", "code description unit_of_measure");

    //#3 validar si existe
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    //#4 responder al cliente
    return res.status(200).json(batch);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

batchController.getByProduct = async (req, res) => {
  try {
    //#1 obtener el id del producto
    const { productId } = req.params;

    //#2 buscar los lotes activos ordenados por fecha de entrada (orden PEPS)
    const batches = await batchModel
      .find({ product_id: productId, status: "Active" })
      .sort({ entry_date: 1 });

    //#3 responder al cliente
    return res.status(200).json(batches);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default batchController;
