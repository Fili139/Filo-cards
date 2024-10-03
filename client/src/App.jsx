import { useState, useEffect } from 'react'
import Hand from './components/Hand';

import io from 'socket.io-client';

import './App.css'


function App() {
  const [socket, setSocket] = useState(null);

  const [playerID, setPlayerID] = useState("");
  const [opponentID, setOpponentID] = useState("");

  const [lastOpponentMove, setLastOpponentMove] = useState("");

  const [mode, setMode] = useState(""); 

  const [deck, setDeck] = useState("");
  const [hand, setHand] = useState([]);
  const [remaining, setRemaining] = useState(52);
  
  const [selectedCard, setSelectedCard] = useState("");


  useEffect(() => {
    if (mode === "multi") {
      // Crea la connessione a Socket.IO solo una volta quando il componente si monta
      const newSocket = io('http://localhost:3000');
      setSocket(newSocket);

      newSocket.on('yourId', (id) => {
        setPlayerID(id);
      });

      newSocket.on('deckID', (deck_id) => {
        setDeck(deck_id)
      });

      /* LOGICA DI GIOCO - RICEVO MOSSE DELL'AVVERSARIO */
      newSocket.on('playerMove', (data) => {
        console.log('Mossa ricevuta dall\'avversario:', data);
        setLastOpponentMove(data);
      });

      newSocket.on('playerDraw', (count, remaining) => {
        console.log("L'avversario ha pescato ", count, " carte rimanenti:", remaining);
        setRemaining(remaining)
      });
      /**************************************************/

      // Funzione di pulizia: disconnetti il socket quando il componente si smonta
      return () => {
        newSocket.off('yourId');
        newSocket.off('deckID');
        newSocket.off('playerMove');
        newSocket.off('playerDraw');
        newSocket.disconnect();
      };
    }
  }, [mode])


  useEffect(() => {
    console.debug(selectedCard)
  }, [selectedCard])

  useEffect(() => {
    console.debug(hand)
  }, [hand])


  const getDeck = () => {
    fetch("https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
    .then((res) => res.json())
    .then((data) => {
      if (data.deck_id) {
        setDeck(data.deck_id)
        
        socket.emit('deckID', data.deck_id);
      }
    })
  }

  const drawCards = (count=3) => {
    //todo - controllare se ci sono abbastanza carte per pescare
    fetch("https://www.deckofcardsapi.com/api/deck/"+deck+"/draw/?count="+count)
    .then((res) => res.json())
    .then((data) => {
      if (data.cards) {
        setHand((prevHand) => [...prevHand, ...data.cards]);
        setRemaining(data.remaining)

        socket.emit('playerDraw', count, data.remaining);
      }
    })
  }

  return (
    <div className="app">
      
      {!mode &&
        <>
          <button onClick={() => setMode("single")}>Single player</button>
          <button onClick={() => setMode("multi")}>Multi player</button>
        </>
      }

      {playerID &&
        <p>Il tuo socket ID è: {playerID}</p>
      }

      {(!deck && mode) &&
        <button onClick={() => getDeck()}>Get a deck</button>
      }

      {(deck && hand.length <= 0) &&
        <button onClick={() => drawCards()}>Get a hand</button>
      }

      {hand.length > 0 &&
        <>
          <p>Mano del giocatore</p>
          <Hand
            cards={hand}
            selectedCard={selectedCard}
            setSelectedCard={setSelectedCard}
          />
          <button onClick={() => drawCards(1)}>Draw a card</button>
        </>
      }
    </div>
  )
}

export default App
