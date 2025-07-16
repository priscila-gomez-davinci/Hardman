
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify(function(error, success) {
    if (error) {
        console.error('Error al verificar Nodemailer transporter:', error);
    } else {
        console.log('Nodemailer transporter listo para enviar emails.');
    }
});


module.exports = transporter; 