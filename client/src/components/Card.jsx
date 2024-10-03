// Card.js
import React from 'react';
import './Card.css';

const Card = ({ code, image, suit, value, selectedCard, setSelectedCard }) => {

  const onCardClick = (code) => {
    if (code != selectedCard)
      setSelectedCard(code)
    else
      setSelectedCard("")
  }

  return (
    <div>
      <img onClick={() => onCardClick(code)} src={image} className="card-image" />
    </div>
  );
}

export default Card;