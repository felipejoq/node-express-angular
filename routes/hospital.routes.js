var express = require("express");
var app = express();

// MIDDLEWARE PARA VERIFICAR AUTENTICACIÓN MEDIANTE TOKEN
var mdAutenticacion = require("../middlewares/autenticate.middleware");

// SCHEMA DEL HOSPITAL
var Hospital = require("../models/hospital.model");

/**********************************************************************
 * Obtener la lista completa de Hospitales
 **********************************************************************/
app.get("/", (req, res, next) => {

  var desde = req.query.desde || 0;
  desde = Number(desde);

  Hospital.find({})
  .skip(desde)
  .limit(5)
  .populate('usuario', 'nombre email img')
  .exec((err, hospitales) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error cargando usuarios",
        errors: err
      });
    }

    Hospital.countDocuments({}, (err, conteo) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error al contar usuarios",
          errors: err
        });
      }
  
      res.status(200).json({
        ok: true,
        total: conteo,
        hospitales: hospitales
      });
    });
  });
});

/**********************************************************************
 * Editar un hospital por ID
 **********************************************************************/
app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  body.usuario = req.usuario._id;

  Hospital.findOneAndUpdate(id, body, { new: true }, (err, hospitalEdit) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: `no existe el hospital con id: ${id}`,
        errors: err
      });
    }

    res.status(200).json({
      ok: true,
      hospital: hospitalEdit
    });
  });
});

/**********************************************************************
 * Registrar un hospital
 **********************************************************************/
app.post("/", mdAutenticacion.verificaToken, (req, res) => {
  var body = req.body;

  var hospital = new Hospital({
    nombre: body.nombre,
    usuario: req.usuario._id
  });

  hospital.save((err, hospitalDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al crear el hospital",
        errors: err
      });
    }

    Hospital.populate(hospitalDB, { path:'usuario', select: 'nombre email' }, (err, hospitalPop) => {

      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al popular el hospital",
          errors: err
        });
      }

      res.status(201).json({
        ok: true,
        hospital: hospitalPop
      });

    });
  });
});

/**********************************************************************
 * Eliminar hospital mediante su ID
 **********************************************************************/
app.delete("/:id", mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;

  Hospital.findByIdAndDelete(id, (err, hospitalDEL) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al eliminar hospital",
        errors: err
      });
    }

    if (!hospitalDEL) {
      return res.status(404).json({
        ok: false,
        mensaje: "El hospital no existe",
        errors: {
          message: "El registro no existe"
        }
      });
    }

    return res.status(200).json({
      ok: true,
      hospital: hospitalDEL
    });
  });
});

module.exports = app;
