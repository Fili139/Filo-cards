// PlayerHand.js
import React from 'react';
import Card from './Card';
import './Hand.css';

const PlayerHand = ({ cards, selectedCard, setSelectedCard }) => {  
  return (
    <div className="player-hand">
      {cards.map((card, index) => (
        <Card origin="hand" key={index} code={card.code} image={card.image} suit={card.suit} value={card.value} selectedCard={selectedCard} setSelectedCard={setSelectedCard} isSelected={selectedCard === card.code}/>
      ))}
    </div>
  );
};

export default PlayerHand;