// Card.js
import React, { useState } from 'react';
import './Card.css';

const Card = ({ origin, code, image, suit, value, selectedCard, setSelectedCard, isSelected }) => {
  const style = isSelected ? "card-image card-selected" : "card-image";

  const onCardClick = (code) => {
    if (origin === "hand") {
      if (code != selectedCard)
        setSelectedCard(code)
      else
        setSelectedCard("")
    }
    else if (origin === "table"){
      if (!selectedCard.includes(code))
        setSelectedCard((prevSelectedCard) => [...prevSelectedCard, code])
      else
        setSelectedCard(selectedCard.filter(card => card != code))
    }
  }

  return (
    <div>
      <img onClick={() => onCardClick(code)} src={image} className={style} />
    </div>
  );
}

export default Card;