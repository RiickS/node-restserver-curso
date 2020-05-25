//CONIGURACIONES GLOBALES NECESARIAS:

// =====================
// Puerto
// =====================
process.env.PORT = process.env.PORT || 3000;


// =====================
// Entorno
// =====================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// =====================
// Expiracion del Token
// =====================
// 60 segundos
// 60 minutos
// 24 horas
// 30 dias
process.env.CADUCIDAD_TOKEN = '720h';

// =====================
// SEED de autenticacion
// =====================
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';

// =====================
// Base de Datos
// =====================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}
process.env.URLDB = urlDB;

if (process.env.NODE_ENV === 'dev') {
    SEED = 'este-es-el-seed-desarollo';
} else {
    SEED = process.env.seedProduccion;
}
process.env.SEED = SEED;

// =====================
// Google Client ID
// =====================
process.env.CLIENT_ID = process.env.CLIENT_ID || '519467979831-bck72pb5pgeaok88m1n3g9uu6rkhrg9j.apps.googleusercontent.com';