const multer = require("multer");

const storage = multer.diskStorage({
  destination: "./src/imagenes/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

module.exports = upload;
