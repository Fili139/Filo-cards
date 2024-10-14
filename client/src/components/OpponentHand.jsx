// OpponentHand.js
import React, { useState, useEffect } from 'react';

const OpponentHand = ({ playedCards }) => {
  const [loaded, setLoaded] = useState([false, ""])
  const [style, setStyle] = useState("card-table-image")
  const [backStyle, setBackStyle] = useState("card-hand-image")

  useEffect(() => {
    if (loaded[0]) {
      // è possibile che il timeout non serva
      setTimeout(() => {
        if (loaded[1] === "front")
          setStyle(prevStyle => prevStyle += " show-card")
        else
          setBackStyle(prevStyle => prevStyle += " show-card")
      }, 100)
    }
  }, [loaded]);

  return (
    <div>
        {/*<p>Opponent's hand: </p>*/}
        
        {playedCards.map((card, i) =>
            <img key={i} onLoad={() => setLoaded([true, "front"])} draggable="false" src={"https://www.deckofcardsapi.com/static/img/"+card.code+".png"} className={style} />  
        )}

        {[...Array(3-playedCards.length)].map((x, i) =>
            <img key={i} onLoad={() => setLoaded([true, "back"])} draggable="false" src="https://www.deckofcardsapi.com/static/img/back.png" className={backStyle} />
        )}
    </div>
  );
}

export default OpponentHand;