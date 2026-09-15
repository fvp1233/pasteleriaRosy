import mongoose from "mongoose";
import batchModel from "../models/Batch.js";
import movementModel from "../models/Movement.js";
import productModel from "../models/products.js";

const movementController = {};

//Descuenta una cantidad de los lotes activos de un producto siguiendo PEPS
//(el lote mas antiguo se consume primero) y registra el movimiento por lote (salida o ajuste)
const consumeFromBatches = async ({
  productId,
  quantity,
  userId,
  reason,
  session,
  movementType = "Out",
}) => {
  //#1 obtener los lotes activos ordenados por fecha de entrada (orden PEPS)
  const batches = await batchModel
    .find({ product_id: productId, status: "Active" })
    .sort({ entry_date: 1 })
    .session(session);

  let remaining = quantity;

  //#2 recorrer los lotes descontando hasta cubrir la cantidad solicitada
  for (const batch of batches) {
    if (remaining <= 0) break;

    const consumed = Math.min(batch.available_quantity, remaining);

    //#3 actualizar la cantidad disponible del lote
    batch.available_quantity -= consumed;
    if (batch.available_quantity === 0) batch.status = "Depleted";
    await batch.save({ session });

    //#4 registrar el movimiento de ese lote
    await new movementModel({
      product_id: productId,
      batch_id: batch._id,
      user_id: userId,
      movement_type: movementType,
      quantity: consumed,
      reason,
    }).save({ session });

    remaining -= consumed;
  }

  //#5 validar que se haya cubierto toda la cantidad requerida
  if (remaining > 0) {
    throw new Error(`Insufficient batch stock for product ${productId}`);
  }
};

movementController.registerExit = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    //#1 solicitar los datos de la salida
    const { product_id, quantity, reason } = req.body;

    //#2 validar que la cantidad solicitada sea positiva
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than zero" });
    }

    //#3 buscar el producto
    const product = await productModel.findById(product_id);
    if (!product || product.is_active === false) {
      return res.status(404).json({ message: "Product not found" });
    }

    //#4 validar que exista suficiente stock
    if (product.total_stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock for this product" });
    }

    //#5 iniciar la transaccion
    session.startTransaction();

    //#6 si es un producto terminado, descontar la receta de los lotes de materia prima
    if (product.type === "Finished Good") {
      for (const item of product.recipe) {
        await consumeFromBatches({
          productId: item.raw_material_id,
          quantity: item.required_quantity * quantity,
          userId: req.user.id,
          reason: `Recipe consumption for exit of ${product.code}${reason ? " - " + reason : ""}`,
          session,
        });
      }
    }

    //#7 descontar tambien de los lotes propios del producto que sale (materia prima o terminado ya producido)
    await consumeFromBatches({
      productId: product._id,
      quantity,
      userId: req.user.id,
      reason,
      session,
    });

    //#8 descontar el stock total del producto que sale
    product.total_stock -= quantity;
    await product.save({ session });

    //#9 confirmar la transaccion
    await session.commitTransaction();

    //#10 responder al cliente
    return res.status(201).json({ message: "Exit registered successfully" });
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

movementController.registerAdjustment = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    //#1 solicitar los datos del ajuste (merma, derrame, caducidad, error, etc.)
    const { product_id, quantity, reason } = req.body;

    //#2 validar que la cantidad y el motivo sean validos
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than zero" });
    }
    if (!reason) {
      return res.status(400).json({ message: "Reason is required for an inventory adjustment" });
    }

    //#3 buscar el producto
    const product = await productModel.findById(product_id);
    if (!product || product.is_active === false) {
      return res.status(404).json({ message: "Product not found" });
    }

    //#4 validar que exista suficiente stock para dar de baja
    if (product.total_stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock for this product" });
    }

    //#5 iniciar la transaccion
    session.startTransaction();

    //#6 descontar de los lotes propios del producto siguiendo PEPS, marcado como ajuste
    await consumeFromBatches({
      productId: product._id,
      quantity,
      userId: req.user.id,
      reason,
      session,
      movementType: "Adjustment",
    });

    //#7 descontar el stock total del producto
    product.total_stock -= quantity;
    await product.save({ session });

    //#8 confirmar la transaccion
    await session.commitTransaction();

    //#9 responder al cliente
    return res.status(201).json({ message: "Adjustment registered successfully" });
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

movementController.getAll = async (req, res) => {
  try {
    //#1 obtener filtros opcionales de la query
    const { product_id, batch_id, movement_type } = req.query;

    //#2 construir el filtro de busqueda
    const filter = {};
    if (product_id) filter.product_id = product_id;
    if (batch_id) filter.batch_id = batch_id;
    if (movement_type) filter.movement_type = movement_type;

    //#3 buscar los movimientos
    const movements = await movementModel
      .find(filter)
      .populate("product_id", "code description")
      .populate("user_id", "name last_name")
      .sort({ movement_date: -1 });

    //#4 responder al cliente
    return res.status(200).json(movements);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default movementController;
