const faker = require('faker');

const generateMockUsers = (numUsers) => {
  const users = [];
  for (let i = 1; i <= numUsers; i++) {
    users.push({
      id_usuario: i,
      id_rol: faker.random.arrayElement([1, 2, 3, 4, 5]), 
      nombre: faker.name.firstName(),
      apellido: faker.name.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password(10), 
    });
  }
  return users;
};

const users = generateMockUsers(10);

export default users;