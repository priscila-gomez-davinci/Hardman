const faker = require('faker');

const productNames = [
  'Teclado Mecánico RGB',
  'Mouse Gaming Inalámbrico',
  'Monitor Curvo 27 pulgadas',
  'Webcam Full HD',
  'Auriculares Gamer con Micrófono',
  'Router WiFi 6',
  'Impresora Multifunción Láser',
  'Disco Duro Externo 2TB',
  'Pendrive USB 128GB',
  'Altavoces Bluetooth Portátiles'
];

const generateMockCart = (numItems) => {
  const items = [];
  let totalCartPrice = 0;

  for (let i = 0; i < numItems; i++) {
    const productName = faker.random.arrayElement(productNames);
    const quantity = faker.datatype.number({ min: 1, max: 5 });
    const pricePerUnit = parseFloat(faker.finance.amount(10, 500, 2)); s
    const itemTotalPrice = quantity * pricePerUnit;
    totalCartPrice += itemTotalPrice;

    items.push({
      nombre_producto: productName,
      cantidad: quantity,
      precio_unidad: pricePerUnit,
      precio_total_producto: parseFloat(itemTotalPrice.toFixed(2)), 
    });
  }

  return {
    productos: items,
    precio_total_carrito: parseFloat(totalCartPrice.toFixed(2)), 
  };
};

// Genera un carrito con un número aleatorio de productos entre 1 y 5
const cart = generateMockCart(faker.datatype.number({ min: 1, max: 5 }));

export default cart;