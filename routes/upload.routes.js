var express = require("express");
var app = express();
var fileUpload = require("express-fileupload");
var fs = require("fs");

var Usuario = require("../models/usuario.model");
var Medico = require("../models/medico.model");
var Hospital = require("../models/hospital.model");

app.use(fileUpload());

/**********************************************************************
 * Subir imagenes y actualizar el registro
 * según tipo de colección e ID del objeto
 **********************************************************************/
app.put("/:tipo/:id", (req, res, next) => {
  var tipo = req.params.tipo;
  var id = req.params.id;

  // Tipos de colecciones permitidas
  var tiposValidos = ["hospitales", "medicos", "usuarios"];
  if (tiposValidos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "Tipo de coleccion no válida",
      errors: {
        message: "Colecciones válidas son: " + tiposValidos.join(", ")
      }
    });
  }

  if (!req.files) {
    return res.status(400).json({
      ok: false,
      mensaje: "No seleccionó nada",
      errors: {
        message: "Debe seleccionar una imagen"
      }
    });
  }

  // Obtener nombre del archivo
  var archivo = req.files.imagen;
  var nombreCortado = archivo.name.split(".");
  var extensionArchivo = nombreCortado[nombreCortado.length - 1];

  // Extensiones de archivos permitidas
  var extensionesValidas = ["png", "jpg", "gif", "jpeg"];

  if (extensionesValidas.indexOf(extensionArchivo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "Extensión no válida",
      errors: {
        message: "las extensiones válidas son: " + extensionesValidas.join(", ")
      }
    });
  }

  // Cambiar nombre archivo personalizado
  var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

  // Mover el archivo del temporal a un path en específico.
  var path = `./uploads/${tipo}/${nombreArchivo}`;

  archivo.mv(path, (err) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al mover archivo",
        errors: err
      });
    }
    subirPorTipo(tipo, id, nombreArchivo, res);
  });
});

// Función para subir el archivo y asignarlo a un registro en las colecciones.
function subirPorTipo(tipo, id, nombreArchivo, res) {
  if (tipo === "usuarios") {
    Usuario.findById(id, (err, usuarioDB) => {
      if (err || !usuarioDB) {

        fs.unlinkSync(`./uploads/${tipo}/${nombreArchivo}`);

        return res.status(400).json({
          ok: false,
          mensaje: "Error al buscar el usuario",
          errors: err
        });
      }

      var pathViejo = "./uploads/usuarios/" + usuarioDB.img;

      // Si el usuario ya tenía una imagen anterior, se elimina.
      if (fs.existsSync(pathViejo)) {
        fs.unlinkSync(pathViejo);
      }

      usuarioDB.img = nombreArchivo;

      usuarioDB.save((err, usuarioActualizado) => {
        return res.status(200).json({
          ok: true,
          mensaje: "Imagen de usuario actualizada",
          usuario: usuarioActualizado
        });
      });
    });
  }

  if (tipo === "medicos") {
    Medico.findById(id, (err, medicoDB) => {

      if (err || !medicoDB) {

        fs.unlinkSync(`./uploads/${tipo}/${nombreArchivo}`);

        return res.status(400).json({
          ok: false,
          mensaje: "Error al buscar el medico",
          errors: err
        });
      }

      console.log(medicoDB);

      var pathViejo = "./uploads/medicos/" + medicoDB.img;

      // Si el usuario ya tenía una imagen anterior, se elimina.
      if (fs.existsSync(pathViejo)) {
        fs.unlinkSync(pathViejo);
      }

      medicoDB.img = nombreArchivo;

      medicoDB.save((err, medicoActualizado) => {
        return res.status(200).json({
          ok: true,
          mensaje: "Imagen de medico actualizada",
          medico: medicoActualizado
        });
      });
    });
  }

  if (tipo === "hospitales") {

    Hospital.findById(id, (err, hospitalDB) => {
        if (err || !hospitalDB) {
          fs.unlinkSync(`./uploads/${tipo}/${nombreArchivo}`);
          
          return res.status(400).json({
            ok: false,
            mensaje: "Error al buscar el hospital",
            errors: err
          });
        }
  
        var pathViejo = "./uploads/hospitales/" + hospitalDB.img;
  
        // Si el usuario ya tenía una imagen anterior, se elimina.
        if (fs.existsSync(pathViejo)) {
          fs.unlinkSync(pathViejo);
        }
  
        hospitalDB.img = nombreArchivo;
  
        hospitalDB.save((err, hospitalActualizado) => {
          return res.status(200).json({
            ok: true,
            mensaje: "Imagen de hospital actualizada",
            hospital: hospitalActualizado
          });
        });
      });

  }
}

module.exports = app;
