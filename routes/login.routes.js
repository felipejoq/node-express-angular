var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

// Google
var CLIENT_ID = require("../config/config.global").CLIENT_ID;
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(CLIENT_ID);

var SEED = require("../config/config.global").SEED;

var app = express();
var Usuario = require("../models/usuario.model");

/**********************************************************************
 * Autenticación por Google.
 **********************************************************************/
async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });

  const payload = ticket.getPayload();
  // const userid = payload["sub"];
  // If request specified a G Suite domain:
  //const domain = payload['hd'];

  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true
  };
}
//verify().catch(console.error);

app.post("/google", async (req, res) => {
  var token = req.body.token;

  var googleUser = await verify(token).catch(e => {
    res.status(403).json({
      ok: false,
      mensaje: "Token no válido"
    });
  });

  Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar usuario",
        errors: err
      });
    }

    if (usuarioDB) {
      if (usuarioDB.google === false) {
        return res.status(400).json({
          ok: false,
          mensaje: "Debe usar su autenticación normal."
        });
      } else {
        var token = jwt.sign({ usuario: usuarioDB }, SEED, {
          expiresIn: 14400
        });

        res.status(200).json({
          ok: true,
          usuario: usuarioDB,
          token: token,
          id: usuarioDB._id
        });
      }
    } else {
      // Si no hay un usuario, debemos crearlo.
      var usuario = new Usuario({
        nombre: googleUser.nombre,
        email: googleUser.email,
        img: googleUser.img,
        google: true,
        password: ":)"
      });

      usuario.save((err, usuarioDB) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: "Error al buscar usuario",
            errors: err
          });
        }

        var token = jwt.sign({ usuario: usuarioDB }, SEED, {
          expiresIn: 14400
        });

        res.status(200).json({
          ok: true,
          usuario: usuarioDB,
          token: token,
          id: usuarioDB._id
        });
      });
    }
  });

  // res.status(200).json({
  //   ok: true,
  //   googleUser: googleUser
  // });
});

/**********************************************************************
 * Autenticación normal
 **********************************************************************/
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
        mensaje: "Credenciales incorrectas - email",
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

    var token = jwt.sign({ usuario: usuarioRegistrdo }, SEED, {
      expiresIn: 14400
    });

    res.status(200).json({
      ok: true,
      usuario: usuarioRegistrdo,
      token: token,
      id: usuarioRegistrdo._id
    });
  });
});

module.exports = app;
