require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const path = require('path');
const session = require('express-session');

const app = express();

// -----------------------------
// Configuración de middlewares
// -----------------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Configuración de sesión
app.use(session({
  secret: process.env.SESSION_SECRET || "clave123",
  name: "contador_cookie",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // en desarrollo
}));

// Servir archivos estáticos
app.use(express.static('public'));

// Servir imágenes de productos
app.use('/imagenes', express.static(path.join(__dirname, 'src/imagenes')));

// -----------------------------
// Middleware de roles
// -----------------------------
function isLogged(req, res, next) {
  if (!req.session.user) return res.redirect("/usuarios/login");
  next();
}

function isVendedor(req, res, next) {
  if (!req.session.user || req.session.user.role !== "vendedor") {
    return res.redirect("/");
  }
  next();
}

function isAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.redirect("/");
  }
  next();
}

app.get("/", (req, res) => {
  if (req.session.user) {
    if (req.session.user.role === "admin") {
      return res.redirect("/admin");      
    } else if (req.session.user.role === "vendedor") {
      return res.redirect("/vendedor");   
    }
  }

  // Si no hay sesión, mostrar pantalla de bienvenida
  res.send(`
    <h2>Bienvenido al Sistema</h2>
    <p>Ir al login:</p>
    <a href="/usuarios/login">Iniciar sesión</a>
  `);
});

// -----------------------------
// Rutas de prueba de sesión
// -----------------------------
app.get("/cerrarSesion", (req, res) => {
  req.session.destroy();
  res.clearCookie("contador_cookie");
  res.send("Sesión cerrada correctamente");
});

app.use((req, res, next) => {
  res.locals.usuario = req.session.user || null;
  next();
});

// -----------------------------
// Routers
// -----------------------------
const routerUsuarios = require("./rutas/routerUsuarios");
const routerAdmin = require("./rutas/routerAdmin");
const routerVendedor = require("./rutas/routerVendedor");
const productosRouter = require('./rutas/routerProductos');
const ventasRouter = require('./rutas/routerVentas');

app.use('/imagenes', express.static(path.join(__dirname, 'src/imagenes')));

// Rutas de usuarios
app.use("/usuarios", routerUsuarios);

// Dashboard normal (vendedor)
app.use("/vendedor", isLogged, routerVendedor);

// Dashboard administrador
app.use("/admin", isLogged, isAdmin, routerAdmin);

// Productos y ventas (accesibles si hay sesión)
app.use('/productos', isLogged, productosRouter);
app.use('/ventas', isLogged, ventasRouter);



// -----------------------------
// Conexión a MongoDB
// -----------------------------
const PORT = process.env.PORT || 3001;
const MONGODB_IMANOL = process.env.MONGODB_IMANOL;

mongoose.connect(MONGODB_IMANOL)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// -----------------------------
// Configuración de vistas
// -----------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'vistas'));

// -----------------------------
// Iniciar servidor
// -----------------------------
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
