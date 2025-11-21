const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/login', (req, res) => {
  res.send(`
    <h2>Login</h2>
    <form method="POST" action="/usuarios/login">
      <input name="username" placeholder="Usuario" required><br>
      <input name="password" type="password" placeholder="Contraseña" required><br>
      <button type="submit">Entrar</button>
    </form>
    <p>¿No tienes cuenta? <a href="/usuarios/register">Crear usuario</a></p>
  `);
});


router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user || user.password !== password) {
    return res.redirect("/");
  }

  // Guardar sesión
  req.session.user = {
    id: user._id,
    username: user.username,
    role: user.role
  };

  // Redirecciones según tipo de usuario
  if (user.role === "admin") {
    return res.redirect("/admin");
  } else {
    return res.redirect("/usuarios/normal");
  }
});

router.get('/normal', (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }
  if (req.session.user.role !== "normal") {
    return res.redirect("/");
  }
  res.send("Bienvenido usuario NORMAL");
});

router.get('/register', (req, res) => {
  res.send(`
    <h2>Crear Usuario</h2>
    <form method="POST" action="/usuarios/register">
      <input name="username" placeholder="Usuario" required><br>
      <input name="password" type="password" placeholder="Contraseña" required><br>
      <select name="role">
        <option value="normal">Normal</option>
        <option value="admin">Admin</option>
      </select><br>
      <button type="submit">Registrar</button>
    </form>
  `);
});

router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const newUser = new User({ username, password, role });
    await newUser.save();
    res.send(`Usuario ${username} creado con rol ${role}`);
  } catch (err) {
    res.redirect("Error al crear usuario: " + err.message);
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.clearCookie("contador_cookie");
  res.redirect("/");
});

module.exports = router;
