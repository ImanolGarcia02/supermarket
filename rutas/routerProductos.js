const express = require('express');
const router = express.Router();
const Venta = require('../models/modelVenta');
const Producto = require('../models/modelProducto');

//  MOSTRAR TODOS LOS PRODUCTOS
router.get('/', async (req, res) => {
  try {
    const productos = await Producto.find().sort({ fechaRegistro: -1 });
    res.render('lista_productos', { productos });
  } catch (error) {
    console.error('Error al cargar productos:', error.message);
    res.status(500).send('Error al cargar productos');
  }
});

//  FORMULARIO PARA AGREGAR PRODUCTO
router.get('/nuevo', (req, res) => {
  res.render('crear_producto');
});

//  CREAR PRODUCTO
router.post('/nuevo', async (req, res) => {
  try {
    const { nombre, precio, stock } = req.body;

    // Validación básica
    if (!nombre || !precio || !stock) {
      return res.status(400).send('Todos los campos son obligatorios');
    }

    const nuevoProducto = new Producto({
      nombre: nombre.trim(),
      precio: parseFloat(precio),
      stock: parseInt(stock),
      fechaRegistro: new Date()
    });

    await nuevoProducto.save();
    res.redirect('/productos');
  } catch (error) {
    console.error('Error al crear producto:', error.message);
    res.status(500).send('Error al crear producto');
  }
});

// FORMULARIO PARA EDITAR PRODUCTO
router.get('/:id/editar', async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) {
      return res.status(404).send('Producto no encontrado');
    }
    res.render('editar_producto', { producto });
  } catch (error) {
    console.error('Error al cargar producto para editar:', error.message);
    res.status(500).send('Error al cargar producto');
  }
});

//  ACTUALIZAR PRODUCTO
router.put('/:id', async (req, res) => {
  try {
    const { nombre, precio, stock } = req.body;

    const productoActualizado = await Producto.findByIdAndUpdate(
      req.params.id,
      {
        nombre: nombre.trim(),
        precio: parseFloat(precio),
        stock: parseInt(stock)
      },
      { new: true }
    );

    if (!productoActualizado) {
      return res.status(404).send('Producto no encontrado');
    }

    res.redirect('/productos');
  } catch (error) {
    console.error('Error al actualizar producto:', error.message);
    res.status(500).send('Error al actualizar producto');
  }
});

//  ELIMINAR PRODUCTO
router.delete('/:id', async (req, res) => {
  try {
    const ventasAsociadas = await Venta.findOne({
      productoId: req.params.id,
      devuelto: false
    });

    if (ventasAsociadas) {
      return res.send(`
        <script>
          alert('No se puede eliminar: el producto tiene ventas registradas');
          window.location.href = '/productos';
        </script>
      `);
    }

    const productoEliminado = await Producto.findByIdAndDelete(req.params.id);
    if (!productoEliminado) {
      return res.send(`
        <script>
          alert('Producto no encontrado');
          window.location.href = '/productos';
        </script>
      `);
    }

    res.redirect('/productos');
  } catch (error) {
    console.error('Error al eliminar producto:', error.message);
    res.send(`
      <script>
        alert('Error al eliminar producto');
        window.location.href = '/productos';
      </script>
    `);
  }
});

module.exports = router;
