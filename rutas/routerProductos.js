const express = require('express');
const router = express.Router();
const Venta = require('../models/modelVenta');
const Producto = require('../models/modelProducto');
const upload = require("../services/imagenService");
const fs = require("fs");

// ---------------------------------------------------------
// MOSTRAR TODOS LOS PRODUCTOS
// ---------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    // 👈 Ahora muestra todos los productos sin filtrar por disponible
    const productos = await Producto.find().sort({ fechaRegistro: -1 });
    res.render('lista_productos', { productos });
  } catch (error) {
    console.error('Error al cargar productos:', error.message);
    res.status(500).send('Error al cargar productos');
  }
});

// ---------------------------------------------------------
// BUSCAR PRODUCTOS POR NOMBRE (ADMIN)
// ---------------------------------------------------------
router.get('/buscar/nombre', async (req, res) => {
  try {
    const { nombre } = req.query;

    // 👈 También sin filtro de disponible
    const productos = await Producto.find({
      nombre: { $regex: nombre, $options: "i" }
    }).sort({ fechaRegistro: -1 });

    res.render('lista_productos', { productos });

  } catch (error) {
    console.error('Error al buscar productos:', error.message);
    res.status(500).send('Error en la búsqueda');
  }
});

// ---------------------------------------------------------
// FORMULARIO PARA AGREGAR PRODUCTO
// ---------------------------------------------------------
router.get('/nuevo', (req, res) => {
  res.render('crear_producto');
});

// ---------------------------------------------------------
// CREAR PRODUCTO (CON IMAGEN)
// ---------------------------------------------------------
router.post('/nuevo', upload.single("imagen"), async (req, res) => {
  try {
    const { nombre, precio, stock } = req.body;

    if (!nombre || !precio || !stock) {
      return res.status(400).send('Todos los campos son obligatorios');
    }

    const nuevoProducto = new Producto({
      nombre: nombre.trim(),
      precio: parseFloat(precio),
      stock: parseInt(stock),
      fechaRegistro: new Date(),
      imagen: req.file ? req.file.filename : null
    });

    await nuevoProducto.save();
    res.redirect('/productos');

  } catch (error) {
    console.error('Error al crear producto:', error.message);
    res.status(500).send('Error al crear producto');
  }
});

// ---------------------------------------------------------
// FORMULARIO PARA EDITAR PRODUCTO
// ---------------------------------------------------------
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

// ---------------------------------------------------------
// ACTUALIZAR PRODUCTO (PERMITE CAMBIAR IMAGEN)
// ---------------------------------------------------------
router.put('/:id', upload.single("imagen"), async (req, res) => {
  try {
    const { nombre, precio, stock } = req.body;
    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).send("Producto no encontrado");
    }

    // Si se sube nueva imagen, borrar la anterior
    if (req.file) {
      if (producto.imagen) {
        try {
          fs.unlinkSync("./src/imagenes/" + producto.imagen);
        } catch {}
      }
      producto.imagen = req.file.filename;
    }

    producto.nombre = nombre.trim();
    producto.precio = parseFloat(precio);
    producto.stock = parseInt(stock);

    await producto.save();

    res.redirect('/productos');

  } catch (error) {
    console.error('Error al actualizar producto:', error.message);
    res.status(500).send('Error al actualizar producto');
  }
});

// ---------------------------------------------------------
// ELIMINAR SOLO LA IMAGEN DEL PRODUCTO
// ---------------------------------------------------------
router.put('/:id/eliminar-imagen', async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) {
      return res.status(404).send("Producto no encontrado");
    }

    if (producto.imagen) {
      const rutaImagen = `./src/imagenes/${producto.imagen}`;
      if (fs.existsSync(rutaImagen)) {
        fs.unlinkSync(rutaImagen);
      }
    }

    producto.imagen = null;
    await producto.save();

    res.redirect(`/productos/${producto._id}/editar`);

  } catch (error) {
    console.error("Error al eliminar imagen:", error);
    res.status(500).send("Error al eliminar imagen");
  }
});

// ---------------------------------------------------------
// ELIMINAR PRODUCTO (BORRADO DEFINITIVO)
// ---------------------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const ventasAsociadas = await Venta.findOne({
      productoId: req.params.id,
      devuelto: false
    });

    if (ventasAsociadas) {
      return res.send(`
        <script>
          alert('No se puede quitar: el producto tiene ventas registradas');
          window.location.href = '/productos';
        </script>
      `);
    }

    // 👈 Ahora se elimina de la base de datos
    await Producto.findByIdAndDelete(req.params.id);

    res.redirect('/productos');

  } catch (error) {
    console.error('Error al eliminar producto:', error.message);
    res.send(`
      <script>
        alert('Error al quitar producto');
        window.location.href = '/productos';
      </script>
    `);
  }
});

module.exports = router;
