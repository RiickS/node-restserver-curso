const express = require('express');

const { verificaToken, verificaAdmin } = require('../middlewares/autenticacion');

const Categoria = require('../models/categoria');
const Producto = require('../models/producto');
const _ = require('underscore');
const app = express();


app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categoria) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Categoria.countDocuments((err, conteo) => {

                res.json({
                    ok: true,
                    categoria,
                    totalRegistros: conteo
                });

            });
        });
});


app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Categoria.findById(id)
        .populate('usuario', 'nombre email')
        .exec((err, categoriaDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'El ID no es valido'
                    }
                });
            }
            if (!categoriaDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Categoria no encontrado'
                    }
                });
            }

            res.json({
                ok: true,
                categoria: categoriaDB
            });

        });

});


app.post('/categoria', [verificaToken, verificaAdmin], (req, res) => {

    let body = req.body;

    let categoria = new Categoria({

        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });

});

//==============================
//Actualizar una categoria
//==============================

app.put('/categoria/:id', [verificaToken, verificaAdmin], (req, res) => {

    let id = req.params.id;
    let body = _.pick(req.body, 'descripcion');

    Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});


app.delete('/categoria/:id', [verificaToken, verificaAdmin], (req, res) => {

    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };
        if (!categoriaBorrada) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoria no encontrada'
                }
            });
        }


        let idCategoria = categoriaBorrada._id;
        Producto.updateMany({ "categoria": idCategoria }, { "$set": { "categoria": null } }, (err, respuesta) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                categoria: categoriaBorrada,
                message: 'Categoria borrada'
            });
        });

    });

});



module.exports = app;