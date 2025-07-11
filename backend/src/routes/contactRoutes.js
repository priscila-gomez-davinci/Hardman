// src/routes/contactRoutes.js
const express = require('express');
const router = express.Router(); // Creamos un nuevo enrutador de Express
const contactController = require('../controllers/contactController'); // Importamos el controlador

// Definimos la ruta POST para enviar el formulario de contacto
// La URL base /api/contact se adjuntará en app.js
router.post('/', contactController.submitContactForm);

// Opcional: Ruta GET para obtener todos los formularios de contacto (generalmente para un rol admin)
// router.get('/', contactController.getAllContacts);

// Opcional: Ruta GET para obtener un formulario de contacto por ID
// router.get('/:id', contactController.getContactById);

module.exports = router; // Exportamos el router para que app.js pueda usarlo