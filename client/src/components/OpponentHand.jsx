// OpponentHand.js
import React from 'react';

const OpponentHand = ({ playedCards }) => {

  return (
    <div>
        <p>Opponent's hand: </p>
        {playedCards.map((card, i) =>
            <img key={i} draggable="false" src={"https://www.deckofcardsapi.com/static/img/"+card.code+".png"} className="card-hand-image" />  
        )}

        {[...Array(3-playedCards.length)].map((x, i) =>
            <img key={i} draggable="false" src="https://www.deckofcardsapi.com/static/img/back.png" className="card-hand-image" />
        )}
    </div>
  );
}

export default OpponentHand;