// Card.js
import React, { useState, useEffect } from 'react';
import './Card.css';

const Card = ({ origin, code, image, suit, value, selectedCard, setSelectedCard, isSelected }) => {
  let style = isSelected ? ( origin === "hand" ? "card-hand-image card-selected" : "card-table-image card-selected") : (origin === "hand" ? "card-hand-image" : "card-table-image")

  /*
  useEffect(() => {
    
  }, []);
  */

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
    <>
      <img
        draggable={origin === "hand" ? true : false}
        onDragStart={(e) => e.dataTransfer.setData('card', JSON.stringify(code)) }
        onLoad={() => setTimeout(() => style += " show-card", 150)}
        onClick={() => onCardClick(code)}
        src={image}
        className={style}
      />
    </>
  );
}

export default Card;