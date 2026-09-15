import productModel from "../models/products.js";

const productController = {};

//Valida que cada raw_material_id de la receta exista y sea Materia Prima
const validateRecipe = async (recipe) => {
  for (const item of recipe) {
    const rawMaterial = await productModel.findById(item.raw_material_id);
    if (!rawMaterial || rawMaterial.type !== "Raw Material") {
      return false;
    }
  }
  return true;
};

productController.create = async (req, res) => {
  try {
    //#1 solicitar los datos a guardar
    const {
      code,
      type,
      description,
      unit_of_measure,
      minimum_stock,
      maximum_stock,
      recipe,
    } = req.body;

    //#2 validar si el codigo ya existe
    const existsProduct = await productModel.findOne({ code });
    if (existsProduct) {
      return res.status(400).json({ message: "Product code already exists" });
    }

    //#3 validar la receta si el producto es terminado
    if (type === "Finished Good" && recipe && recipe.length > 0) {
      const isValidRecipe = await validateRecipe(recipe);
      if (!isValidRecipe) {
        return res.status(400).json({ message: "Recipe contains an invalid raw material" });
      }
    }

    //#4 crear el nuevo producto
    const newProduct = new productModel({
      code,
      type,
      description,
      unit_of_measure,
      minimum_stock,
      maximum_stock,
      total_stock: 0,
      is_prepared: type === "Finished Good",
      recipe: type === "Finished Good" ? recipe : [],
      is_active: true,
    });

    //#5 guardar el producto en la base de datos
    await newProduct.save();

    //#6 responder al cliente
    return res.status(201).json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

productController.getAll = async (req, res) => {
  try {
    //#1 obtener filtros opcionales de la query
    const { type, includeInactive } = req.query;

    //#2 construir el filtro de busqueda
    const filter = {};
    if (type) filter.type = type;
    if (includeInactive !== "true") filter.is_active = { $ne: false };

    //#3 buscar los productos
    const products = await productModel.find(filter);

    //#4 responder al cliente
    return res.status(200).json(products);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

productController.getById = async (req, res) => {
  try {
    //#1 obtener el id del producto
    const { id } = req.params;

    //#2 buscar el producto y poblar la receta
    const product = await productModel
      .findById(id)
      .populate("recipe.raw_material_id", "code description unit_of_measure");

    //#3 validar si existe
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    //#4 responder al cliente
    return res.status(200).json(product);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

productController.update = async (req, res) => {
  try {
    //#1 obtener el id y los datos a actualizar
    const { id } = req.params;
    const { description, unit_of_measure, minimum_stock, maximum_stock, recipe } = req.body;

    //#2 buscar el producto
    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    //#3 validar la receta si viene en la actualizacion
    if (product.type === "Finished Good" && recipe) {
      const isValidRecipe = await validateRecipe(recipe);
      if (!isValidRecipe) {
        return res.status(400).json({ message: "Recipe contains an invalid raw material" });
      }
      product.recipe = recipe;
    }

    //#4 actualizar los campos permitidos
    if (description !== undefined) product.description = description;
    if (unit_of_measure !== undefined) product.unit_of_measure = unit_of_measure;
    if (minimum_stock !== undefined) product.minimum_stock = minimum_stock;
    if (maximum_stock !== undefined) product.maximum_stock = maximum_stock;

    //#5 guardar los cambios
    await product.save();

    //#6 responder al cliente
    return res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

productController.deactivate = async (req, res) => {
  try {
    //#1 obtener el id del producto
    const { id } = req.params;

    //#2 buscar el producto
    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    //#3 marcar el producto como inactivo
    product.is_active = false;

    //#4 guardar los cambios
    await product.save();

    //#5 responder al cliente
    return res.status(200).json({ message: "Product deactivated successfully" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default productController;
