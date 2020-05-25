// Requerimos las librerias necesarias
const express = require('express');

const bcrypt = require('bcryptjs');
const _ = require('underscore');

const Usuario = require('../models/usuario');

//Importamos los middlewares
const { verificaToken, verificaAdmin } = require('../middlewares/autenticacion');
const app = express();

//Declaramos los metodos a usar

app.get('/usuario', [verificaToken], (req, res) => {


    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;

    limite = Number(limite);

    Usuario.find({ estado: true }, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }


            Usuario.countDocuments({ estado: true }, (err, conteo) => {

                res.json({
                    ok: true,
                    usuarios,
                    totalRegistros: conteo

                });


            });

        });

});

app.post('/usuario', [verificaToken, verificaAdmin], (req, res) => {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });


    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // usuarioDB.password = null;

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });

});

app.put('/usuario/:id', [verificaToken, verificaAdmin], (req, res) => {

    let id = req.params.id;

    // Filtramos los campos que necesitabamos
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);


    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    })

});

app.delete('/usuario/:id', [verificaToken, verificaAdmin], (req, res) => {

    let id = req.params.id;
    let cambioEstado = {
        estado: false
    };


    Usuario.findByIdAndUpdate(id, cambioEstado, { new: true }, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });


    });


});


module.exports = app;