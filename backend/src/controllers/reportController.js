import mongoose from "mongoose";
import batchModel from "../models/Batch.js";
import movementModel from "../models/Movement.js";
import productModel from "../models/products.js";

const reportController = {};

reportController.getInventoryValuation = async (req, res) => {
  try {
    //#1 obtener el filtro opcional de producto
    const { product_id } = req.query;

    //#2 construir el filtro de lotes activos
    const matchStage = { status: "Active" };
    if (product_id) matchStage.product_id = new mongoose.Types.ObjectId(product_id);

    //#3 agrupar los lotes activos por producto y calcular su valor (PEPS: cantidad disponible * costo unitario del lote)
    const valuation = await batchModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$product_id",
          total_quantity: { $sum: "$available_quantity" },
          total_value: { $sum: { $multiply: ["$available_quantity", "$unit_cost"] } },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 0,
          product_id: "$product._id",
          code: "$product.code",
          description: "$product.description",
          type: "$product.type",
          unit_of_measure: "$product.unit_of_measure",
          total_quantity: 1,
          total_value: 1,
        },
      },
      { $sort: { code: 1 } },
    ]);

    //#4 calcular el valor total del inventario
    const grandTotal = valuation.reduce((sum, item) => sum + item.total_value, 0);

    //#5 responder al cliente
    return res.status(200).json({ products: valuation, grand_total: grandTotal });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

reportController.getKardex = async (req, res) => {
  try {
    //#1 obtener los filtros del reporte
    const { product_id, start_date, end_date } = req.query;

    //#2 validar que se haya indicado un producto
    if (!product_id) {
      return res.status(400).json({ message: "product_id is required" });
    }

    //#3 validar que el producto exista
    const product = await productModel.findById(product_id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    //#4 definir el rango de fechas del reporte
    const startDate = start_date ? new Date(start_date) : new Date(0);
    const endDate = end_date ? new Date(end_date) : new Date();

    //#5 obtener todos los movimientos del producto hasta la fecha final, ordenados cronologicamente
    const movements = await movementModel
      .find({ product_id, movement_date: { $lte: endDate } })
      .populate("user_id", "name last_name")
      .sort({ movement_date: 1 });

    //#6 recorrer los movimientos calculando el saldo corriente (inventario inicial + entradas - salidas)
    let balance = 0;
    let initialBalance = 0;
    let totalEntries = 0;
    let totalExits = 0;
    let totalAdjustments = 0;
    const kardexRows = [];

    for (const movement of movements) {
      let signedQuantity = 0;
      if (movement.movement_type === "In") signedQuantity = movement.quantity;
      if (movement.movement_type === "Out") signedQuantity = -movement.quantity;
      if (movement.movement_type === "Adjustment") signedQuantity = -movement.quantity;

      if (movement.movement_date < startDate) {
        //#6.1 los movimientos previos al rango solo componen el inventario inicial
        balance += signedQuantity;
        initialBalance = balance;
        continue;
      }

      //#6.2 los movimientos dentro del rango arman las filas del kardex
      balance += signedQuantity;
      if (movement.movement_type === "In") totalEntries += movement.quantity;
      if (movement.movement_type === "Out") totalExits += movement.quantity;
      if (movement.movement_type === "Adjustment") totalAdjustments += movement.quantity;

      kardexRows.push({
        date: movement.movement_date,
        type: movement.movement_type,
        quantity: movement.quantity,
        balance_after: balance,
        batch_id: movement.batch_id,
        reason: movement.reason,
        user: movement.user_id,
      });
    }

    //#7 responder al cliente
    return res.status(200).json({
      product: {
        id: product._id,
        code: product.code,
        description: product.description,
        unit_of_measure: product.unit_of_measure,
      },
      start_date: startDate,
      end_date: endDate,
      initial_balance: initialBalance,
      total_entries: totalEntries,
      total_exits: totalExits,
      total_adjustments: totalAdjustments,
      final_balance: balance,
      movements: kardexRows,
    });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

reportController.getMonthlyClosing = async (req, res) => {
  try {
    //#1 obtener el periodo y el filtro opcional de producto
    const { year, month, product_id } = req.query;

    //#2 validar que el periodo sea valido
    if (!year || !month || month < 1 || month > 12) {
      return res.status(400).json({ message: "A valid year and month (1-12) are required" });
    }

    //#3 calcular la fecha de corte (ultimo dia del mes solicitado)
    const closingDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);

    //#4 construir el filtro de lotes vigentes a la fecha de corte
    const matchBatch = { entry_date: { $lte: closingDate } };
    if (product_id) matchBatch.product_id = new mongoose.Types.ObjectId(product_id);

    //#5 reconstruir, por lote, cuanto queda disponible a la fecha de corte (inicial - salidas hasta esa fecha)
    //   y agrupar por producto para obtener la existencia y el valor final (PEPS) de ese cierre
    const closing = await batchModel.aggregate([
      { $match: matchBatch },
      {
        $lookup: {
          from: "movements",
          let: { batchId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$batch_id", "$$batchId"] },
                movement_type: "Out",
                movement_date: { $lte: closingDate },
              },
            },
            { $group: { _id: null, total: { $sum: "$quantity" } } },
          ],
          as: "outMovements",
        },
      },
      {
        $addFields: {
          consumed: { $ifNull: [{ $arrayElemAt: ["$outMovements.total", 0] }, 0] },
        },
      },
      {
        $addFields: {
          remaining_quantity: { $subtract: ["$initial_quantity", "$consumed"] },
        },
      },
      {
        $group: {
          _id: "$product_id",
          closing_quantity: { $sum: "$remaining_quantity" },
          closing_value: { $sum: { $multiply: ["$remaining_quantity", "$unit_cost"] } },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 0,
          product_id: "$product._id",
          code: "$product.code",
          description: "$product.description",
          type: "$product.type",
          closing_quantity: 1,
          closing_value: 1,
        },
      },
      { $sort: { code: 1 } },
    ]);

    //#6 calcular el valor total del cierre
    const grandTotal = closing.reduce((sum, item) => sum + item.closing_value, 0);

    //#7 responder al cliente
    return res.status(200).json({
      period: `${year}-${String(month).padStart(2, "0")}`,
      closing_date: closingDate,
      products: closing,
      grand_total: grandTotal,
    });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

reportController.getFinishedGoodsRotation = async (req, res) => {
  try {
    //#1 obtener el rango de fechas opcional
    const { start_date, end_date } = req.query;

    //#2 construir el filtro de movimientos de salida
    const matchStage = { movement_type: "Out" };
    if (start_date || end_date) {
      matchStage.movement_date = {};
      if (start_date) matchStage.movement_date.$gte = new Date(start_date);
      if (end_date) matchStage.movement_date.$lte = new Date(end_date);
    }

    //#3 agrupar las salidas por producto terminado y sumar las cantidades vendidas
    const rotation = await movementModel.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "products",
          localField: "product_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      { $match: { "product.type": "Finished Good" } },
      {
        $group: {
          _id: "$product._id",
          code: { $first: "$product.code" },
          description: { $first: "$product.description" },
          total_sold: { $sum: "$quantity" },
        },
      },
      {
        $project: {
          _id: 0,
          product_id: "$_id",
          code: 1,
          description: 1,
          total_sold: 1,
        },
      },
      { $sort: { total_sold: -1 } },
    ]);

    //#4 responder al cliente
    return res.status(200).json(rotation);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

reportController.getShrinkageReport = async (req, res) => {
  try {
    //#1 obtener los filtros opcionales del reporte
    const { start_date, end_date, product_id } = req.query;

    //#2 construir el filtro de movimientos de tipo ajuste
    const matchStage = { movement_type: "Adjustment" };
    if (product_id) matchStage.product_id = new mongoose.Types.ObjectId(product_id);
    if (start_date || end_date) {
      matchStage.movement_date = {};
      if (start_date) matchStage.movement_date.$gte = new Date(start_date);
      if (end_date) matchStage.movement_date.$lte = new Date(end_date);
    }

    //#3 traer cada ajuste con el costo unitario del lote afectado, para valorizar la perdida
    const shrinkage = await movementModel.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "batches",
          localField: "batch_id",
          foreignField: "_id",
          as: "batch",
        },
      },
      { $unwind: "$batch" },
      {
        $lookup: {
          from: "products",
          localField: "product_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          value_lost: { $multiply: ["$quantity", "$batch.unit_cost"] },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$movement_date",
          product_id: "$product._id",
          code: "$product.code",
          description: "$product.description",
          quantity: 1,
          unit_cost: "$batch.unit_cost",
          value_lost: 1,
          reason: 1,
          user: { name: "$user.name", last_name: "$user.last_name" },
        },
      },
      { $sort: { date: -1 } },
    ]);

    //#4 calcular el valor total perdido en el periodo
    const totalValueLost = shrinkage.reduce((sum, item) => sum + item.value_lost, 0);

    //#5 responder al cliente
    return res.status(200).json({ records: shrinkage, total_value_lost: totalValueLost });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default reportController;
