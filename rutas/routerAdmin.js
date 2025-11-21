const express = require('express');
const router = express.Router();

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
router.get("/", verificarAdmin, (req, res) => {
  res.send("Bienvenido administrador");
});

// Ruta adicional exclusiva para administradores
router.get("/panel", verificarAdmin, (req, res) => {
  res.send("Panel administrativo — solo administradores");
});

module.exports = router;
