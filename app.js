// Requires
var express     = require('express');
var mongoose    = require('mongoose');
var bodyParser  = require('body-parser');

// Inicializar variables
var app = express();

// MIDLEWARE PARA LOS CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
  });


// Configuración de Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Importar Rutas
var appRoutes = require('./routes/index.routes');
var usuarioRoutes = require('./routes/usuario.routes');
var loginRoutes = require('./routes/login.routes');
var hospitalRoutes = require('./routes/hospital.routes');
var medicoRoutes = require('./routes/medico.routes');
var busquedaRoutes = require('./routes/busqueda.routes');
var uploadsRoutes = require('./routes/upload.routes');
var imagenesRoutes = require('./routes/imagenes.routes');

// Conexión a la DB
var opciones = {
    useNewUrlParser: true,
    useCreateIndex: true
}
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', opciones, (err, res) => {
    if(err) throw err;
    console.log('Base de datos \x1b[32m%s\x1b[0m', 'Online');
});

// Middleware de rutas
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadsRoutes);
app.use('/img', imagenesRoutes);
app.use('/', appRoutes);


// Escuchar peticiones al servidor expres.
app.listen(3000, '0.0.0.0', () => {
    console.log('Servidor arriba en http://localhost:3000 \x1b[32m%s\x1b[0m', 'Online');
});