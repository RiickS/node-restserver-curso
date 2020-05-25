const express = require('express');

const { verificaToken, verificaAdmin } = require('../middlewares/autenticacion');

const Producto = require('../models/producto');
const _ = require('underscore');
const app = express();


//=============================
// Obtener prodcuto
//=============================
app.get('/producto', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({ disponible: true }, 'nombre descripcion precio')
        .skip(desde)
        .limit(limite)
        .sort('nombre')
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, producto) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Producto.countDocuments({ disponible: true }, (err, conteo) => {

                res.json({
                    ok: true,
                    producto,
                    totalRegistros: conteo

                });
            });
        });

});

//=============================
// Obtener producto por ID
//=============================
app.get('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'El ID no es valido'
                    }
                });
            }
            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Producto no encontrado'
                    }
                });
            }
            res.json({
                ok: true,
                producto: productoDB
            });


        });

});

//=============================
// Buscar productos
//=============================

app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex, disponible: true }, 'nombre descripcion precio')
        .sort('nombre')
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, producto) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Producto.countDocuments({ nombre: regex, disponible: true }, (err, conteo) => {

                res.json({
                    ok: true,
                    producto,
                    totalRegistros: conteo

                });
            });

        });

});

app.post('/producto', [verificaToken, verificaAdmin], (req, res) => {

    let body = req.body;

    let producto = new Producto({

        nombre: body.nombre,
        precio: body.precio,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });

});

app.put('/producto/:id', [verificaToken, verificaAdmin], (req, res) => {

    let id = req.params.id;
    let body = _.pick(req.body, ['precio', 'descripcion', 'categoria', 'disponible']);

    body.usuario = req.usuario._id;

    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            producto: productoDB
        });
    });
});


app.delete('/producto/:id', [verificaToken, verificaAdmin], (req, res) => {

    let id = req.params.id;
    let cambioDisponible = {
        disponible: false
    };

    Producto.findByIdAndUpdate(id, cambioDisponible, { new: true }, (err, productoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }
        res.json({
            ok: true,
            producto: productoBorrado,
            message: 'Disponibilidad cambiada'
        });
    });

});




//CAMBIAR COUNT DE USUARIO Y CATEGORIA



module.exports = app;