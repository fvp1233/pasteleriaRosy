import productModel from "../models/products.js";

const alertController = {};

alertController.getLowStock = async (req, res) => {
  try {
    //#1 buscar productos activos cuyo stock total sea menor o igual al minimo
    const products = await productModel.find({
      is_active: { $ne: false },
      $expr: { $lte: ["$total_stock", "$minimum_stock"] },
    });

    //#2 responder al cliente
    return res.status(200).json(products);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

alertController.getOverStock = async (req, res) => {
  try {
    //#1 buscar productos activos cuyo stock total supere el maximo permitido
    const products = await productModel.find({
      is_active: { $ne: false },
      maximum_stock: { $gt: 0 },
      $expr: { $gte: ["$total_stock", "$maximum_stock"] },
    });

    //#2 responder al cliente
    return res.status(200).json(products);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default alertController;
