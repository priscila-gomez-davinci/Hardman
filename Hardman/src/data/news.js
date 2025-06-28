const faker = require('faker');

const generateMockNews = (numNews) => {
  const news = [];
  for (let i = 1; i <= numNews; i++) {
    news.push({
      id_noticia: `news${String(i).padStart(3, '0')}`,
      titulo: faker.lorem.sentence(5), 
      categoria: faker.random.arrayElement(['Tecnología', 'Programación', 'Hardware', 'Software', 'Ciberseguridad', 'Inteligencia Artificial']),
      cuerpo_noticia: faker.lorem.paragraphs(3), 
    });
  }
  return news;
};

const news = generateMockNews(10); 

export default news;