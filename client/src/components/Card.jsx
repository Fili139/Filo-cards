// Card.js
import React, { useState } from 'react';
import './Card.css';

const Card = ({ origin, code, image, selectedCard, setSelectedCard, isSelected, lift=false }) => {
  const [loaded, setLoaded] = useState(false)

  // className is derived from props/state on every render, so classes can't pile up or go stale
  const baseClass = (origin === "hand" || origin === "opponent") ? "card-hand-image" : "card-table-image"
  const className = [
    baseClass,
    loaded && "show-card",
    isSelected && "card-selected",
    lift && "lift-card"
  ].filter(Boolean).join(" ")

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
      {(!loaded && origin === "opponent") &&
        <img
          draggable={false}
          src="https://www.deckofcardsapi.com/static/img/back.png"
          className="back-card-hand-image"
        />
      }

      <img
        draggable={origin === "hand" ? true : false}
        onDragStart={(e) => e.dataTransfer.setData('card', JSON.stringify(code)) }
        onLoad={() => setLoaded(true)}
        onClick={() => { if (code) onCardClick(code) }}
        src={image}
        className={className}
        style={{ display: loaded ? "" : "none" }}
      />
    </>
  );
}

export default Card;