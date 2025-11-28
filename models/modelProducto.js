const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  precio: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  imagen: {
    type: String,
    default: ''   // opcional: ruta o nombre de archivo
  }
});

// 👇 Ajuste para evitar OverwriteModelError
module.exports = mongoose.models.Producto || mongoose.model('Producto', productoSchema);
