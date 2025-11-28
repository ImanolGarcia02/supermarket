const express = require('express');
const router = express.Router();
const Venta = require("../models/modelVenta");

// ---------------------------------------------------------
// Middleware para verificar rol vendedor
// ---------------------------------------------------------
function verificarVendedor(req, res, next) {
  if (!req.session.user) {
    return res.send("Debes iniciar sesión primero");
  }
  if (req.session.user.role !== "vendedor") {
    return res.redirect("/");
  }
  next();
}

// ---------------------------------------------------------
// PANEL PRINCIPAL DEL VENDEDOR (resumen estilo adminDashboard)
// ---------------------------------------------------------
router.get("/", verificarVendedor, async (req, res) => {
  try {
    const ventas = await Venta.find({ cancelada: false });
    const totalVentas = ventas.length;
    const totalIngresos = ventas.reduce((sum, v) => sum + v.total, 0);

    // Renderiza el panel principal usando vendedorDashboard.ejs
    res.render("vendedorDashboard", { totalVentas, totalIngresos });
  } catch (error) {
    console.error("Error al cargar panel vendedor:", error.message);
    res.status(500).send("Error al cargar panel");
  }
});

// ---------------------------------------------------------
// VISTA DETALLADA DE VENTAS (tabla con cancelar)
// ---------------------------------------------------------
router.get("/ventas", verificarVendedor, async (req, res) => {
  try {
    const ventas = await Venta.find().populate("productoId").sort({ fechaVenta: -1 });
    const totalVentas = ventas.length;
    const totalIngresos = ventas.reduce((sum, v) => sum + v.total, 0);

    // Renderiza la misma vista vendedorDashboard.ejs pero con ventas
    res.render("vendedorDashboard", { ventas, totalVentas, totalIngresos });
  } catch (error) {
    console.error("Error al cargar ventas vendedor:", error.message);
    res.status(500).send("Error al cargar ventas");
  }
});


// ---------------------------------------------------------
// CANCELAR UNA VENTA
// ---------------------------------------------------------
router.post("/ventas/:id/cancelar", verificarVendedor, async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id);
    if (!venta) throw new Error("Venta no encontrada");

    venta.cancelada = true; // asegúrate de tener este campo en el modelo
    await venta.save();

    res.redirect("/vendedor/ventas");
  } catch (error) {
    console.error("Error al cancelar venta:", error.message);
    res.status(500).send("Error al cancelar venta");
  }
});

// ---------------------------------------------------------
// EXPORTAR ROUTER
// ---------------------------------------------------------
module.exports = router;
