require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const path = require('path');
const session = require('express-session');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || "clave123", 
  name: "contador_cookie",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

function isLogged(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/");
  }
  next();
}

function isNormal(req, res, next) {
  if (req.session.user.role !== "normal") {
    return res.redirect("/");
  }
  next();
}

function isAdmin(req, res, next) {
  if (req.session.user.role !== "admin") {
    return res.redirect("/");
  }
  next();
}

app.get("/", (req, res) => {
  res.send(`
    <h2>Bienvenido</h2>
    <p>Ir al login:</p>
    <a href="/usuarios/login">Iniciar sesión</a>
  `);
});

app.get("/contador", (req, res) => {
  if (req.session.views) {
    req.session.views++;
    res.send("Has entrado " + req.session.views + " veces");
  } else {
    req.session.views = 1;
    res.send("Has entrado por primera vez al sitio");
  }
});

app.get("/otra", (req, res) => {
  req.session.views++;
  res.send("A este sitio has entrado " + req.session.views + " veces");
});

app.get("/cerrarSesion", (req, res) => {
  req.session.destroy();
  res.clearCookie("contador_cookie");
  res.send("Sesión cerrada correctamente");
});

const routerUsuarios = require("./rutas/routerUsuarios");
const routerAdmin = require("./rutas/routerAdmin");

app.use("/usuarios", routerUsuarios);

app.get("/normal", isLogged, isNormal, (req, res) => {
  res.send("Bienvenido, eres un usuario NORMAL");
});

app.use("/admin", isLogged, isAdmin, routerAdmin);

const PORT = process.env.PORT || 3001;
const MONGODB_IMANOL = process.env.MONGODB_IMANOL;

mongoose.connect(MONGODB_IMANOL)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'vistas'));

app.use(methodOverride('_method'));
app.use(express.static('public'));

const productosRouter = require('./rutas/routerProductos');
const ventasRouter = require('./rutas/routerVentas');

app.use('/productos', isLogged, productosRouter);
app.use('/ventas', isLogged, ventasRouter);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
