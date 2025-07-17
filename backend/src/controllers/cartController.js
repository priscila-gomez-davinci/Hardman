// src/controllers/cartController.js
import pool from '../config/db.js';

// --- OBTENER TODOS LOS ITEMS DEL CARRITO PARA UN ID_PEDIDO (CARRITO) ESPECÍFICO ---
// GET /api/cart/:pedidoId
export const getCartItems = async (req, res) => {
    try {
        const { pedidoId } = req.params;
        const [rows] = await pool.query(`
            SELECT
                dp.id_detalle_pedido,
                dp.id_pedido,
                dp.id_producto,
                p.nombre_producto AS product_name,
                p.imagen_url AS product_image,
                dp.cantidad,
                dp.precio_unitario,
                dp.sub_total,
                dp.id_metodo_pago
            FROM
                detalle_pedido AS dp
            JOIN
                producto AS p ON dp.id_producto = p.id_producto
            WHERE dp.id_pedido = ?;
        `, [pedidoId]);
        res.json({ cartItems: rows });
    } catch (error) {
        console.error('Error al obtener ítems del carrito:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- AÑADIR UN ITEM AL CARRITO / ACTUALIZAR CANTIDAD SI YA EXISTE ---
// POST /api/cart
export const addOrUpdateCartItem = async (req, res) => {
    try {
        const { id_pedido, id_producto, cantidad, id_metodo_pago } = req.body;

        if (!id_pedido || !id_producto || !cantidad) {
            return res.status(400).json({ message: 'ID de pedido, ID de producto y cantidad son obligatorios.' });
        }
        if (cantidad <= 0) {
            return res.status(400).json({ message: 'La cantidad debe ser mayor que cero.' });
        }

        // 1. Obtener el precio unitario del producto y verificar existencia
        const [productRows] = await pool.query('SELECT precio_minorista FROM producto WHERE id_producto = ?', [id_producto]);
        if (productRows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        const precioUnitario = parseFloat(productRows[0].precio_minorista);
        const subTotal = cantidad * precioUnitario;

        // 2. Verificar si el item ya existe en el carrito (para el mismo id_pedido y id_producto)
        const [existingItem] = await pool.query(
            'SELECT id_detalle_pedido, cantidad FROM detalle_pedido WHERE id_pedido = ? AND id_producto = ?',
            [id_pedido, id_producto]
        );

        let result;
        if (existingItem.length > 0) {
            // Si el item existe, actualizar cantidad, precio_unitario y sub_total
            const newCantidad = existingItem[0].cantidad + cantidad;
            const newSubTotal = newCantidad * precioUnitario;

            [result] = await pool.query(
                `UPDATE detalle_pedido SET
                    cantidad = ?,
                    precio_unitario = ?,
                    sub_total = ?,
                    id_metodo_pago = ?
                WHERE id_detalle_pedido = ?;`,
                [newCantidad, precioUnitario, newSubTotal, id_metodo_pago || null, existingItem[0].id_detalle_pedido]
            );
            res.status(200).json({ message: 'Cantidad de ítem en carrito actualizada.', id_detalle_pedido: existingItem[0].id_detalle_pedido });
        } else {
            // Si el item no existe, añadirlo como un nuevo detalle de pedido
            [result] = await pool.query(
                `INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario, sub_total, id_metodo_pago)
                VALUES (?, ?, ?, ?, ?, ?);`,
                [id_pedido, id_producto, cantidad, precioUnitario, subTotal, id_metodo_pago || null]
            );
            res.status(201).json({ message: 'Ítem añadido al carrito exitosamente.', id_detalle_pedido: result.insertId });
        }

    } catch (error) {
        console.error('Error al añadir/actualizar ítem en carrito:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- ACTUALIZAR CANTIDAD DE UN ITEM ESPECÍFICO EN EL CARRITO ---
// PUT /api/cart/:id_detalle_pedido
export const updateCartItemQuantity = async (req, res) => {
    try {
        const { id_detalle_pedido } = req.params;
        const { cantidad } = req.body;

        if (cantidad === undefined || cantidad < 0) {
            return res.status(400).json({ message: 'La cantidad es obligatoria y no puede ser negativa.' });
        }

        // 1. Obtener el detalle existente para obtener id_producto y precio_unitario
        const [detailRows] = await pool.query('SELECT id_producto, precio_unitario FROM detalle_pedido WHERE id_detalle_pedido = ?', [id_detalle_pedido]);
        if (detailRows.length === 0) {
            return res.status(404).json({ message: 'Detalle de carrito no encontrado.' });
        }
        const { id_producto, precio_unitario } = detailRows[0];
        const subTotal = cantidad * precio_unitario;

        if (cantidad === 0) {
            // Si la cantidad es 0, eliminar el ítem del carrito
            const [result] = await pool.query('DELETE FROM detalle_pedido WHERE id_detalle_pedido = ?', [id_detalle_pedido]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Detalle de carrito no encontrado para eliminar.' });
            }
            return res.status(200).json({ message: 'Ítem eliminado del carrito (cantidad 0).' });
        }

        // 2. Actualizar la cantidad y sub_total
        const [result] = await pool.query(
            `UPDATE detalle_pedido SET
                cantidad = ?,
                sub_total = ?
            WHERE id_detalle_pedido = ?;`,
            [cantidad, subTotal, id_detalle_pedido]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Detalle de carrito no encontrado o no se realizaron cambios.' });
        }
        res.status(200).json({ message: 'Cantidad de ítem en carrito actualizada exitosamente.' });

    } catch (error) {
        console.error('Error al actualizar cantidad de ítem en carrito:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};


// --- ELIMINAR UN ITEM ESPECÍFICO DEL CARRITO ---
// DELETE /api/cart/:id_detalle_pedido
export const removeCartItem = async (req, res) => {
    try {
        const { id_detalle_pedido } = req.params;
        const [result] = await pool.query('DELETE FROM detalle_pedido WHERE id_detalle_pedido = ?', [id_detalle_pedido]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Ítem de carrito no encontrado.' });
        }
        res.status(200).json({ message: 'Ítem eliminado del carrito exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar ítem de carrito:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- LIMPIAR TODO EL CARRITO PARA UN ID_PEDIDO ESPECÍFICO ---
// DELETE /api/cart/clear/:pedidoId
export const clearCart = async (req, res) => {
    try {
        const { pedidoId } = req.params;
        const [result] = await pool.query('DELETE FROM detalle_pedido WHERE id_pedido = ?', [pedidoId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Carrito no encontrado o ya vacío para el ID de pedido proporcionado.' });
        }
        res.status(200).json({ message: 'Carrito limpiado exitosamente.' });
    } catch (error) {
        console.error('Error al limpiar carrito:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};