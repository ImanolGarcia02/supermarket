const express = require('express');
const router = express.Router();
const Venta = require('../models/modelVenta');
const Producto = require('../models/modelProducto');

//  LISTAR VENTAS
router.get('/', async (req, res) => {
  try {
    const ventas = await Venta.find()
      .populate('productoId')
      .sort({ fechaVenta: -1 });

    res.render('lista_ventas', { ventas });
  } catch (error) {
    console.error(' Error al cargar ventas:', error.message);
    res.status(500).send('Error al cargar ventas');
  }
});

//  FORMULARIO PARA CREAR NUEVA VENTA
router.get('/nuevo', async (req, res) => {
  try {
    const productos = await Producto.find({ stock: { $gt: 0 } });
    res.render('crear_venta', { productos });
  } catch (error) {
    console.error(' Error al cargar formulario de ventas:', error.message);
    res.status(500).send('Error al cargar formulario de ventas');
  }
});

//  CREAR UNA NUEVA VENTA
router.post('/', async (req, res) => {
  try {
    const { productoId, cliente, cantidad, total, fechaVenta } = req.body;
    console.log(' Datos recibidos:', req.body);

    // Validación básica
    if (!productoId || !cliente || !cantidad || !total) {
      throw new Error('Todos los campos son obligatorios');
    }

    const producto = await Producto.findById(productoId);
    if (!producto) throw new Error('Producto no encontrado');
    if (producto.stock < cantidad) throw new Error('Stock insuficiente');

    const nuevaVenta = new Venta({
      productoId,
      cliente: cliente.trim(),
      cantidad: parseInt(cantidad),
      total: parseFloat(total),
      fechaVenta: new Date(fechaVenta)
    });

    await nuevaVenta.save();

    const nuevoStock = producto.stock - nuevaVenta.cantidad;
    await Producto.findByIdAndUpdate(productoId, { stock: nuevoStock });

    res.redirect('/ventas');
  } catch (error) {
    console.error(' Error al crear venta:', error.message);
    res.status(500).send('Error al crear venta');
  }
});

//  FORMULARIO PARA EDITAR VENTA
router.get('/:id/editar', async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id).populate('productoId');
    const productos = await Producto.find();
    res.render('editar_venta', { venta, productos });
  } catch (error) {
    console.error('Error al cargar venta para editar:', error.message);
    res.status(500).send('Error al cargar venta');
  }
});

// ACTUALIZAR UNA VENTA
router.put('/:id', async (req, res) => {
  try {
    const { productoId, cliente, cantidad, total } = req.body;
    const ventaAnterior = await Venta.findById(req.params.id);

    if (!ventaAnterior) throw new Error('Venta no encontrada');

    // Ajustar stock si cambió la cantidad
    if (ventaAnterior.cantidad !== Number(cantidad)) {
      const producto = await Producto.findById(ventaAnterior.productoId);
      const diferencia = Number(cantidad) - ventaAnterior.cantidad;
      await Producto.findByIdAndUpdate(productoId, { stock: producto.stock - diferencia });
    }

    await Venta.findByIdAndUpdate(req.params.id, {
      productoId,
      cliente: cliente.trim(),
      cantidad: parseInt(cantidad),
      total: parseFloat(total)
    });

    res.redirect('/ventas');
  } catch (error) {
    console.error('Error al actualizar venta:', error.message);
    res.status(500).send('Error al actualizar venta');
  }
});

//  ELIMINAR VENTA
router.delete('/:id', async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id);
    if (!venta) throw new Error('Venta no encontrada');

    const producto = await Producto.findById(venta.productoId);
    const nuevoStock = producto.stock + venta.cantidad;
    await Producto.findByIdAndUpdate(venta.productoId, { stock: nuevoStock });

    await Venta.findByIdAndDelete(req.params.id);
    res.redirect('/ventas');
  } catch (error) {
    console.error(' Error al eliminar venta:', error.message);
    res.send(`
      <script>
        alert('Error al eliminar venta');
        window.location.href = '/ventas';
      </script>
    `);
  }
});

module.exports = router;
