const Producto = require("../models/producto.model");
const fs = require("fs");

exports.crearProducto = async (req, res) => {
  try {
    const data = req.body;

    if (req.file) {
      data.imagen = req.file.filename;
    }

    const nuevo = new Producto(data);
    await nuevo.save();
    res.json({ msg: "Producto creado", nuevo });
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.editarProducto = async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.quitarProducto = async (req, res) => {
  try {
    await Producto.findByIdAndUpdate(req.params.id, { disponible: false });
    res.json({ msg: "Producto marcado como no disponible" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Buscar por nombre
exports.buscarPorNombre = async (req, res) => {
  try {
    const productos = await Producto.find({
      nombre: { $regex: req.query.nombre, $options: "i" }
    });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error });
  }
};
