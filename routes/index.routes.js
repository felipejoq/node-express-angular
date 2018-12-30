var express     = require('express');
var app = express();

// Rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Estas en el servidor de node con express.'
    });
});

module.exports = app;