require('./config/config');

const express = require('express'); // Libreria de node.js
const mongoose = require('mongoose'); // Libreria para uso de mongoDB
const path = require('path'); //Traducción de rutas

const app = express();

const bodyParser = require('body-parser'); //Evaluar el body de tipo json

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// habilitar la carpeta public
app.use(express.static(path.resolve(__dirname, '../public')));


// Configuración global de rutas
app.use(require('./routes/index'));


mongoose.connect(process.env.URLDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}, (err, res) => {

    if (err) throw err;

    console.log(`Base de datos ONLINE`);

});


app.listen(process.env.PORT, () => {
    console.log(`Escuchando puerto: `, 3000);
});