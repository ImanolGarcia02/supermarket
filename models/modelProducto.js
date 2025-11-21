const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: {            
    type: String,
    required: true
  },
  precio: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0      
  },
  fechaRegistro: {      
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Producto', productoSchema);
