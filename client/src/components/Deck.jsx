// Deck.js
import React from 'react';

const Deck = ({ remaining }) => {

  return (
    <div>
        <p>Cards remaining: {remaining}</p>
        <img src="https://www.deckofcardsapi.com/static/img/back.png" className="card-image" />
    </div>
  );
}

export default Deck;