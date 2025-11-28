const express = require('express');
const router = express.Router();
const Producto = require("../models/modelProducto");
const Venta = require("../models/modelVenta");

// Middleware para verificar rol administrador
function verificarAdmin(req, res, next) {
  if (!req.session.user) {
    return res.send("Debes iniciar sesión primero");
  }
  if (req.session.user.role !== "admin") {
    return res.redirect("/");
  }
  next();
}

// Página principal del panel admin
router.get("/", verificarAdmin, async (req, res) => {
  try {
    const totalProductos = await Producto.countDocuments();
    const totalVentas = await Venta.countDocuments();
    const ventas = await Venta.find();
    const totalIngresos = ventas.reduce((sum, v) => sum + v.total, 0);

    res.render("adminDashboard", { totalProductos, totalVentas, totalIngresos });
  } catch (error) {
    console.error("Error al cargar dashboard admin:", error.message);
    res.status(500).send("Error al cargar dashboard");
  }
});

module.exports = router;
