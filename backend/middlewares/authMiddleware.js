const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ message: 'Token no proporcionado.' });
    }

    const token = authHeader.split(' ')[1]; // "Bearer TOKEN"
    if (!token) {
        return res.status(403).json({ message: 'Formato de token inválido.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Fallo al autenticar el token.' });
        }
        req.userId = decoded.userId;
        req.userRole = decoded.roleId;
        req.userEmail = decoded.email;
        next(); // Continuar a la siguiente función de middleware/ruta
    });
};

const isAdmin = (req, res, next) => {
    if (req.userRole !== 1) { 
        return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
    }
    next();
};

module.exports = { verifyToken, isAdmin };