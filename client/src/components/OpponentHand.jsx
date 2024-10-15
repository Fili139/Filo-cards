// OpponentHand.js
import React from 'react';
import Card from './Card';

const OpponentHand = ({ playedCards }) => {
  return (
    <div>
        {/*<p>Opponent's hand: </p>*/}
        
        {playedCards.map((card, index) =>
          <Card origin={"opponent"} key={index} code={card.code} image={"https://www.deckofcardsapi.com/static/img/"+card.code+".png"} suit={""} value={""} selectedCard={""} setSelectedCard={""} isSelected={""} />  
        )}

        {[...Array(3-playedCards.length)].map((x, index) =>
          <Card origin={"opponent"} key={index} code={""} image={"https://www.deckofcardsapi.com/static/img/back.png"} suit={""} value={""} selectedCard={""} setSelectedCard={""} isSelected={""} />  
        )}
    </div>
  );
}

export default OpponentHand;