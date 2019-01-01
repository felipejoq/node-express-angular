var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

var mdAutenticacion = require("../middlewares/autenticate.middleware");

var app = express();
var Usuario = require("../models/usuario.model");

/**********************************************************************
 * Obtener la lista completa de usuarios
 **********************************************************************/
app.get("/", (req, res, next) => {

  var desde = req.query.desde || 0;
  desde = Number(desde);

  // Usuario.find({}, "nombre email img role").exec((err, usuariosDB) => {
  Usuario.find({})
  .skip(desde)
  .limit(5)
  .exec((err, usuariosDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error cargando usuarios",
        errors: err
      });
    }

    Usuario.countDocuments({}, (err, conteo) => {

      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error cargando usuarios",
          errors: err
        });
      }

      res.status(200).json({
        ok: true,
        total: conteo,
        usuarios: usuariosDB
      });
    });

    
  });
});

/**********************************************************************
 * Actualizar un usuario
 **********************************************************************/
app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Usuario.findById(id, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar el usuario.",
        errors: err
      });
    }

    if (!usuarioDB) {
      return res.status(400).json({
        ok: false,
        mensaje: `El usuario con el ${id} no existe`,
        errors: {
          message: "No existe un usuario con ese ID"
        }
      });
    }

    /**
     * // Otra forma de asignar los valores a las propiedades del objeto
     * Object.keys(req.body).forEach(key => {
     * usuario[key] = req.body[key];
     * });
     */

    usuarioDB.nombre = body.nombre;
    usuarioDB.email = body.email;
    usuarioDB.role = body.role;

    usuarioDB.save((err, usuarioGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar el usuario",
          errors: err
        });
      }

      res.status(201).json({
        ok: true,
        usuario: usuarioGuardado
      });
    });
  });
});

/**********************************************************************
 * Crear un nuevo usuario
 **********************************************************************/
app.post("/", (req, res) => {
  // Obteniendo el objeto que se envía desde el cliente como un json
  body = req.body;

  var usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    img: body.img,
    role: body.role
  });

  usuario.save((err, usuarioDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al crear usuario",
        errors: err
      });
    }

    return res.status(201).json({
      ok: true,
      usuario: usuarioDB
    });
  });
});

/**********************************************************************
 * Eliminar un usuario mediante su ID
 **********************************************************************/
app.delete("/:id", mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;

  Usuario.findByIdAndDelete(id, (err, usuarioEliminado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al eliminar usuario",
        errors: err
      });
    }

    if (!usuarioEliminado) {
      return res.status(404).json({
        ok: false,
        mensaje: "El usuario no existe",
        errors: {
          message: "El registro no existe"
        }
      });
    }

    return res.status(200).json({
      ok: true,
      usuario: usuarioEliminado
    });
  });
});

module.exports = app;
