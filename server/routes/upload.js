const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

//default options
app.use(fileUpload());

app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) {

        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'No se ha seleccionado ningun archivo'
                }
            });
    }


    //validar tipos

    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son ' + tiposValidos.join(', '),
            }
        })

    }


    let archivo = req.files.archivo;
    let nombreArchivo = archivo.name.split('.');
    let extension = nombreArchivo[nombreArchivo.length - 1];


    //Extensiones permitidas

    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];


    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son ' + extensionesValidas.join(', '),
                ext: extension
            }
        })

    }

    //Cambiar el nombre del archivo

    let nombreFile = `${ id }-${ new Date().getTime() }.${ extension }`;


    archivo.mv(`uploads/${ tipo }/${ nombreFile }`, (err) => {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            });

        // Aqui, imagen cargada

        updateImg(tipo, id, res, nombreFile)

    });

});

function updateImg(tipo, id, res, nombreFile) {

    let entity = tipo == 'usuarios' ? Usuario : Producto;
    let message = tipo == 'usuarios' ? 'Usuario no encontrado' : 'Producto no encontrado';
    entity.findByIdAndUpdate(id, { img: nombreFile }, (err, entityDB) => {
        if (err) {

            borraArchivo(nombreFile, tipo)

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!entityDB) {

            borraArchivo(nombreFile, tipo)

            return res.status(400).json({
                ok: false,
                err: {
                    message
                }
            });
        }

        // let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${ entityDB.img }`);
        // if (fs.existsSync(pathImagen)) {
        //     fs.unlinkSync(pathImagen);

        // }

        borraArchivo(entityDB.img, tipo)

        if (tipo == 'usuarios') {
            res.json({
                ok: true,
                usuario: entityDB,
                img: nombreFile
            });
        } else {
            res.json({
                ok: true,
                producto: entityDB,
                img: nombreFile
            });
        }
    });

}

function borraArchivo(nombreImagen, tipo) {

    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${ nombreImagen }`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);

    }


}

module.exports = app;