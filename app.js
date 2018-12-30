// Requires
var express     = require('express');
var mongoose    = require('mongoose');
var bodyParser  = require('body-parser');

// Inicializar variables
var app = express();

// Configuración de Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Importar Rutas
var appRoutes = require('./routes/index.routes');
var usuarioRoutes = require('./routes/usuario.routes');
var loginRoutes = require('./routes/login.routes');

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
app.use('/usuarios', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);


// Escuchar peticiones al servidor expres.
app.listen(3000, '0.0.0.0', () => {
    console.log('Servidor arriba en http://localhost:3000 \x1b[32m%s\x1b[0m', 'Online');
});