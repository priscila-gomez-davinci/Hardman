import React from 'react';
import { Container } from 'react-bootstrap';
import NewsCard from '../NewsCard/NewsCard';
import news from '../../data/noticias';

const News = () => {
  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Noticias Recientes</h2>
      {news.map(item=>(
        <NewsCard key={item.id} newsItem={item} />
      ))}
    </Container>
  );
};

export default News;