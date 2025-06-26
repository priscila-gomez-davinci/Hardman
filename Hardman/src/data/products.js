const faker = require('faker');

const categories = [
  'Procesadores',
  'Tarjetas Gráficas',
  'Memorias RAM',
  'Almacenamiento',
  'Placas Base',
  'Fuentes de Poder',
  'Gabinetes',
  'Monitores',
  'Periféricos',
  'Software',
];

const generateMockProducts = (numProducts) => {
  const products = [];
  for (let i = 1; i <= numProducts; i++) {
    const category = faker.random.arrayElement(categories);
    const productName = `${faker.commerce.productAdjective()} ${faker.commerce.product()}`; 
    const price = parseFloat(faker.commerce.price(50, 1500, 2)); 
    const stock = faker.datatype.number({ min: 10, max: 200 });

    products.push({
      id: `prod${String(i).padStart(3, '0')}`,
      name: productName,
      price: price,
      image: faker.image.technics(640, 480, true), 
      description: faker.lorem.paragraph(2), 
      category: category,
      stock: stock,
    });
  }
  return products;
};

const products = generateMockProducts(10); 

export default products;