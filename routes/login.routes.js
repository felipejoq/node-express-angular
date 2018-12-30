var express = require("express");
var bcrypt  = require("bcryptjs");
var jwt     = require('jsonwebtoken');

var SEED = require('../config/config.global').SEED;

var app = express();
var Usuario = require("../models/usuario.model");

app.post("/", (req, res) => {
  var body = req.body;

  Usuario.findOne({ email: body.email }, (err, usuarioRegistrdo) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar usuario",
        errors: err
      });
    }

    if (!usuarioRegistrdo) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Credenciales incorrectas - email',
        errors: {
          message: "Usuario o contraseña incorrecta"
        }
      });
    }

    if (!bcrypt.compareSync(body.password, usuarioRegistrdo.password)) {
      return res.status(400).json({
        ok: false,
        mensaje: `Credenciales incorrectas - password`,
        errors: {
          message: "Usuario o contraseña incorrecta"
        }
      });
    }

    /**
     * GENERAR UN TOKEN
     * jsonwebtoken - https://github.com/auth0/node-jsonwebtoken
     * La firma tiene 3 parámetros:
     * - Payload: Cuerpo del Token.
     * - Semilla: Inicio de la encriptación.
     * - Fecha Expiración: En este caso en milisegundos. (4 horas)
     */ 
    var token = jwt.sign({ usuario: usuarioRegistrdo }, SEED, { expiresIn: 14400 })


    res.status(200).json({
      ok: true,
      usuario: usuarioRegistrdo,
      token: token,
      id: usuarioRegistrdo._id
    });
  });
});

module.exports = app;
