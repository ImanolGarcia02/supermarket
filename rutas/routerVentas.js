const express = require('express');
const router = express.Router();
const Venta = require('../models/modelVenta');
const Producto = require('../models/modelProducto');

// =====================================
//  LISTAR VENTAS
// =====================================
router.get('/', async (req, res) => {
  try {
    const ventas = await Venta.find()
      .populate('productoId')
      .sort({ fechaVenta: -1 });

    res.render('lista_ventas', { 
      ventas,
      usuario: req.session.user   // ← NECESARIO PARA LA VISTA
    });

  } catch (error) {
    console.error('Error al cargar ventas:', error.message);
    res.status(500).send('Error al cargar ventas');
  }
});

// =====================================
//  FORMULARIO PARA CREAR NUEVA VENTA
// =====================================
router.get('/nuevo', async (req, res) => {
  try {
    // 👈 Ajuste: ya no usamos "disponible"
    const productos = await Producto.find({ stock: { $gt: 0 } });

    res.render('crear_venta', { 
      productos,
      usuario: req.session.user
    });

  } catch (error) {
    console.error('Error al cargar formulario:', error.message);
    res.status(500).send('Error al cargar formulario');
  }
});

// =====================================
//  CREAR UNA NUEVA VENTA
// =====================================
router.post('/', async (req, res) => {
  try {
    const { productoId, cliente, cantidad } = req.body;

    if (!productoId || !cliente || !cantidad) {
      throw new Error('Todos los campos son obligatorios');
    }

    const producto = await Producto.findById(productoId);
    if (!producto) throw new Error('Producto no encontrado');
    if (producto.stock < cantidad) throw new Error('Stock insuficiente');

    const totalCalculado = producto.precio * cantidad;

    const nuevaVenta = new Venta({
      productoId,
      cliente: cliente.trim(),
      cantidad: parseInt(cantidad),
      total: totalCalculado,
      fechaVenta: new Date(),   // FECHA AUTOMÁTICA
      cancelada: false          // 👈 corregido: usamos "cancelada"
    });

    await nuevaVenta.save();

    await Producto.findByIdAndUpdate(productoId, {
      stock: producto.stock - cantidad
    });

    res.redirect('/ventas');

  } catch (error) {
    console.error('Error al crear venta:', error.message);
    res.status(500).send(error.message);
  }
});

// =====================================
//  FORMULARIO PARA EDITAR VENTA
// =====================================
router.get('/:id/editar', async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id).populate('productoId');
    const productos = await Producto.find(); // 👈 ya no filtramos por disponible

    res.render('editar_venta', { 
      venta, 
      productos,
      usuario: req.session.user
    });

  } catch (error) {
    console.error('Error al cargar venta para editar:', error.message);
    res.status(500).send('Error al cargar venta');
  }
});

// =====================================
//  ACTUALIZAR UNA VENTA
// =====================================
router.put('/:id', async (req, res) => {
  try {
    const { productoId, cliente, cantidad } = req.body;

    const ventaAnterior = await Venta.findById(req.params.id);
    if (!ventaAnterior) throw new Error('Venta no encontrada');

    const producto = await Producto.findById(productoId);
    const totalCalculado = producto.precio * cantidad;

    const diferencia = cantidad - ventaAnterior.cantidad;

    if (diferencia !== 0) {
      if (producto.stock < diferencia) throw new Error('Stock insuficiente');

      await Producto.findByIdAndUpdate(productoId, {
        stock: producto.stock - diferencia
      });
    }

    await Venta.findByIdAndUpdate(req.params.id, {
      productoId,
      cliente: cliente.trim(),
      cantidad: parseInt(cantidad),
      total: totalCalculado
    });

    res.redirect('/ventas');

  } catch (error) {
    console.error('Error al actualizar venta:', error.message);
    res.status(500).send(error.message);
  }
});

// =====================================
//  CANCELAR VENTA
// =====================================
router.put('/:id/cancelar', async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id);
    if (!venta) throw new Error('Venta no encontrada');

    const producto = await Producto.findById(venta.productoId);

    await Producto.findByIdAndUpdate(producto._id, {
      stock: producto.stock + venta.cantidad
    });

    venta.cancelada = true;
    await venta.save();

    res.redirect('/ventas');

  } catch (error) {
    console.error('Error al cancelar venta:', error.message);
    res.status(500).send('Error al cancelar venta');
  }
});

/// =====================================
//  BUSCAR VENTAS POR FECHA (hora local)
// =====================================
router.get('/buscar/fecha', async (req, res) => {
  try {
    const { fecha } = req.query; // esperado: yyyy-mm-dd desde <input type="date">

    // Construir rango usando hora local del servidor (sin "Z")
    const inicio = new Date(fecha);
    inicio.setHours(0, 0, 0, 0);

    const fin = new Date(fecha);
    fin.setHours(23, 59, 59, 999);

    const ventas = await Venta.find({
      fechaVenta: { $gte: inicio, $lte: fin }
    }).populate('productoId');

    res.render('lista_ventas', { 
      ventas,
      usuario: req.session.user
    });

  } catch (error) {
    console.error('Error al buscar ventas:', error.message);
    res.status(500).send('Error en la búsqueda');
  }
});

module.exports = router;
