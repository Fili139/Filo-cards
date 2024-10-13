// Card.js
import React, { useState, useEffect } from 'react';
import './Card.css';

const Card = ({ origin, code, image, suit, value, selectedCard, setSelectedCard, isSelected }) => {
  const [loaded, setLoaded] = useState(false)
  const [style, setStyle] = useState(origin === "hand" ? "card-hand-image" : "card-table-image")

  useEffect(() => {
    if (isSelected)
      setStyle(prevStyle => prevStyle += " card-selected")
    else
      setStyle(prevStyle => prevStyle.replace("card-selected", ""))
  }, [isSelected]);

  useEffect(() => {
    if (loaded) {
      // è possibile che il timeout non serva
      setTimeout(() => {
        setStyle(prevStyle => prevStyle += " show-card")
      }, 100)
    }
  }, [loaded]);
  

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
        onLoad={() => setLoaded(true)}
        onClick={() => onCardClick(code)}
        src={image}
        className={style}
      />
    </>
  );
}

export default Card;