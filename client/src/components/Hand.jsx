// PlayerHand.js
import React from 'react';
import Card from './Card';

const PlayerHand = ({ cards, selectedCard, setSelectedCard }) => {
  return (
    <div className="player-hand">
      {cards.map((card, index) => (
        <Card key={index} code={card.code} image={card.image} suit={card.suit} value={card.value} selectedCard={selectedCard} setSelectedCard={setSelectedCard} />
      ))}
    </div>
  );
};

export default PlayerHand;