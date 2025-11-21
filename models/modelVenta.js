const mongoose = require('mongoose');

const ventaSchema = new mongoose.Schema({
  productoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: true
  },
  cliente: {
    type: String,
    required: true
  },
  cantidad: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  fechaVenta: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Venta', ventaSchema);