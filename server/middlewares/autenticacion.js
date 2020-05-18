const jwt = require('jsonwebtoken');

//=======================
// Verificar TOKKEN
//=======================
let verificaToken = (req, res, next) => {

    let token = req.get('token');


    jwt.verify(token, process.env.SEED, (err, decoded) => {


        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no valido'
                }
            });
        }

        req.usuario = decoded.usuario;
        next();

    });


};

//=======================
// Verificar ADMIN_ROLE
//=======================

let verificaAdmin = (req, res, next) => {

    let usuario = req.usuario;

    if (usuario.role != 'ADMIN_ROLE') {

        return res.status(401).json({
            ok: false,
            err: {
                message: 'ROLE INVALIDO'
            }
        });
    }

    next();

};


module.exports = {
    verificaToken,
    verificaAdmin
}