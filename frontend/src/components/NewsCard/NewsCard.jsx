import React from 'react';
import { Card } from 'react-bootstrap';

const NewsCard = ({ newsItem }) => {
  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <Card.Title>{newsItem.title}</Card.Title>
        <Card.Text>{newsItem.description}</Card.Text>
        <Card.Subtitle className="mb-2 text-muted">{new Date(newsItem.date).toLocaleDateString('en-GB')}</Card.Subtitle>
      </Card.Body>
    </Card>
  );
};

export default NewsCard;