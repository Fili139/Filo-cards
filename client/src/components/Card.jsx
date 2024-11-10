// Card.js
import React, { useState, useEffect } from 'react';
import './Card.css';

const Card = ({ origin, code, image, suit, value, selectedCard, setSelectedCard, isSelected, lift=false }) => {
  const [loaded, setLoaded] = useState(false)
  const [style, setStyle] = useState((origin === "hand" || origin === "opponent") ? "card-hand-image" : "card-table-image")

  useEffect(() => {
    if (isSelected)
      setStyle(prevStyle => prevStyle += " card-selected")
    else
      setStyle(prevStyle => prevStyle.replace("card-selected", ""))
  }, [isSelected]);

  useEffect(() => {
    if (loaded)
      setStyle(prevStyle => prevStyle += " show-card")
  }, [loaded]);

  useEffect(() => {
    if (lift)
      setStyle(prevStyle => prevStyle += " lift-card")
  }, [lift]);

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
        className={style}
        style={{ display: loaded ? "" : "none" }}
      />
    </>
  );
}

export default Card;