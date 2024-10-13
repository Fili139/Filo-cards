// OpponentHand.js
import React, { useState } from 'react';

const OpponentHand = ({ playedCards }) => {
  const [show, setShow] = useState("")

  return (
    <div>
        {/*<p>Opponent's hand: </p>*/}
        
        {playedCards.map((card, i) =>
            <img key={i} onLoad={() => setShow("show-card")} draggable="false" src={"https://www.deckofcardsapi.com/static/img/"+card.code+".png"} className={"card-hand-image " + show} />  
        )}

        {[...Array(3-playedCards.length)].map((x, i) =>
            <img key={i} onLoad={() => setShow("show-card")} draggable="false" src="https://www.deckofcardsapi.com/static/img/back.png" className={"card-hand-image " + show} />
        )}
    </div>
  );
}

export default OpponentHand;