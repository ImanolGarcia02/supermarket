const Venta = require("../models/modelVenta");
const Producto = require("../models/model");

exports.realizarVenta = async (req, res) => {
  try {
    const { productoId, cantidad } = req.body;

    const producto = await Producto.findById(productoId);

    if (!producto) return res.json({ error: "Producto no encontrado" });
    if (producto.stock < cantidad) return res.json({ error: "Stock insuficiente" });

    // Disminuir stock
    producto.stock -= cantidad;
    await producto.save();

    // Crear venta
    const venta = new Venta({
      productoId,
      cantidad,
      total: producto.precio * cantidad
    });

    await venta.save();

    res.json({ msg: "Venta realizada", venta });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Listado completo (admin)
exports.listarVentas = async (req, res) => {
  const ventas = await Venta.find().populate("productoId");
  res.json(ventas);
};

// Editar venta (solo vendedor)
exports.editarVenta = async (req, res) => {
  const venta = await Venta.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(venta);
};

// Cancelar venta
exports.cancelarVenta = async (req, res) => {
  await Venta.findByIdAndUpdate(req.params.id, { cancelada: true });
  res.json({ msg: "Venta cancelada" });
};

// Buscar ventas por fecha
exports.buscarPorFecha = async (req, res) => {
  const { fecha } = req.query;

  const inicio = new Date(fecha);
  const fin = new Date(fecha);
  fin.setHours(23, 59, 59);

  const ventas = await Venta.find({
    fecha: { $gte: inicio, $lte: fin }
  }).populate("productoId");

  res.json(ventas);
};
