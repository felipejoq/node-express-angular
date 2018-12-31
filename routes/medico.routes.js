var express = require("express");
var app = express();

// MIDDLEWARE PARA VERIFICAR AUTENTICACIÓN MEDIANTE TOKEN
var mdAutenticacion = require("../middlewares/autenticate.middleware");

var Medico = require("../models/medico.model");

/**********************************************************************
 * Obtener la lista completa de Médicos
 **********************************************************************/
app.get("/", (req, res, next) => {

  var desde = req.query.desde || 0;
  desde = Number(desde);

  Medico.find({})
  .skip(desde)
  .limit(5)
  .populate('usuario', 'nombre email img')
  .populate('hospital')
  .exec((err, medicos) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error cargando medicos",
        errors: err
      });
    }

    Medico.countDocuments({}, (err, conteo) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error al contar medicos",
          errors: err
        });
      }
  
      res.status(200).json({
        ok: true,
        total: conteo,
        medicos: medicos
      });
    });
  });
});

/**********************************************************************
 * Editar un médico mediante su ID
**********************************************************************/
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

  var id = req.params.id;
  var body = req.body;

  body.usuario = req.usuario._id;

  Medico.findOneAndUpdate(id, body, { new: true }, (err, medicoEdit) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: `no existe el médico con id: ${id}`,
        errors: err
      });
    }

    res.status(200).json({
      ok: true,
      medico: medicoEdit
    });
  });

});

/**********************************************************************
 * Registrar un médico
 **********************************************************************/
app.post("/", mdAutenticacion.verificaToken, (req, res) => {
  var body = req.body;

  var medico = new Medico({
    nombre: body.nombre,
    usuario: req.usuario._id,
    hospital: body.hospital,
    img: null
  });

  medico.save((err, medicoDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al crear el medico",
        errors: err
      });
    }

    return res.status(201).json({
      ok: true,
      medico: medicoDB
    });
  });
});

/**********************************************************************
 * Eliminar medico mediante su id
 **********************************************************************/
app.delete("/:id", mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;

  Medico.findByIdAndDelete(id, (err, medicoDel) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al eliminar medico",
        errors: err
      });
    }

    if (!medicoDel) {
      return res.status(404).json({
        ok: false,
        mensaje: "El medico no existe",
        errors: {
          message: "El registro no existe"
        }
      });
    }

    return res.status(200).json({
      ok: true,
      medico: medicoDel
    });
  });
});


module.exports = app;
