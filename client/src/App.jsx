import { useState, useEffect } from 'react'

import Hand from './components/Hand'
import Deck from './components/Deck'
import JoinRoomForm from './components/JoinRoomForm'

import io from 'socket.io-client'

import './App.css'
import Table from './components/Table'


function App() {
  const deckCards = "AS,AD,AC,AH,2S,2D,2C,2H,3S,3D,3C,3H,4S,4D,4C,4H,5S,5D,5C,5H,6S,6D,6C,6H,7S,7D,7C,7H,JS,JD,JC,JH,QS,QD,QC,QH,KS,KD,KC,KH";

  const [socket, setSocket] = useState(null);

  const [room, setRoom] = useState("");

  const [players, setPlayers] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [isMyTurn, setIsMyTurn] = useState(false);

  const [playerID, setPlayerID] = useState("");
  
  const [cardsDealt, setCardsDealt] = useState(false);

  const [mode, setMode] = useState(""); 

  const [deck, setDeck] = useState("");
  const [hand, setHand] = useState([]);
  const [table, setTable] = useState([]);
  const [remaining, setRemaining] = useState(52);
  
  const [opponentsHand, setOpponentsHand] = useState(0);

  const [selectedCard, setSelectedCard] = useState("");
  const [selectedTableCard, setSelectedTableCard] = useState([]);
  

  useEffect(() => {
    if (mode === "multi") {

      // Crea la connessione a Socket.IO solo una volta quando il componente si monta
      const newSocket = io('http://localhost:3000');

      setSocket(newSocket);
  
      newSocket.emit('joinRoom', room);
  
      newSocket.on('yourID', (id) => {
        newSocket.emit('playerID', id);
  
        setPlayerID(id.replaceAll("-", ""));
      });
  
      newSocket.on('deckID', (deck_id) => {
        setDeck(deck_id)
      });
  
      newSocket.on('playersUpdate', ({ players, currentTurn }) => {
        setPlayers(players);
        setCurrentTurn(currentTurn);
      });
  
      newSocket.on('turnUpdate', ({ currentTurn }) => {
        setCurrentTurn(currentTurn);
      });
  
      /* LOGICA DI GIOCO - RICEVO MOSSE DELL'AVVERSARIO */
      newSocket.on('playerMove', (cards_taken, newTable) => {
        console.log('Mossa ricevuta dall\'avversario: carte prese:', cards_taken);
        
        setTable(newTable)
      });
  
      newSocket.on('playerDraw', (count, remaining) => {
        console.log("L'avversario ha pescato:", count, "carte rimanenti nel mazzo:", remaining);
        setRemaining(remaining)
      });
  
      newSocket.on('handUpdate', (handCount) => {
        setOpponentsHand(handCount)
      });
  
      newSocket.on('dealCards', (table_cards, remaining) => {
        console.log("L'avversario ha dato le carte:", table_cards);
        
        setTable(table_cards);
        setRemaining(remaining)
      });
      /**************************************************/
  
      // Funzione di pulizia: disconnetti il socket quando il componente si smonta
      return () => {
        newSocket.off('yourID');
        newSocket.off('playerID');
        newSocket.off('deckID');
        newSocket.off('playersUpdate');
        newSocket.off('turnUpdate');
        newSocket.off('playerMove');
        newSocket.off('playerDraw');
        newSocket.off('handUpdate');
        newSocket.off('dealCards');
  
        newSocket.disconnect();
      };
    }
  }, [room])

  useEffect(() => {
    console.debug("Selected card:", selectedCard)
  }, [selectedCard])

  useEffect(() => {
    console.debug("Selected table cards:", selectedTableCard)
  }, [selectedTableCard])

  useEffect(() => {
    if (hand.length > 0) {
      console.debug("Player hand:", hand)
  
      socket.emit("handUpdate", hand.length, room)
    }
  }, [hand])

  useEffect(() => {
    if (table.length > 0) {
      console.debug("Table:", table)
    }
  }, [table])

  useEffect(() => {
    setIsMyTurn(playerID === currentTurn);
  }, [playerID, currentTurn]);


  const endTurn = () => {
    if (isMyTurn)
      socket.emit('endTurn', room);
  };

  const getDeck = async () => {
    const playerCount = await fetchPlayersInRoom()

    if (playerCount === 2) {
      fetch("https://www.deckofcardsapi.com/api/deck/new/shuffle/?cards="+deckCards)
      .then((res) => res.json())
      .then(async (data) => {
        if (data.deck_id) {
          setDeck(data.deck_id)
          
          await dealCards(4, data.deck_id)
          socket.emit('deckID', data.deck_id, room);

          setCardsDealt(true)
        }
      })
    }
  }

  const dealCards = async (count=4, deckID) => {
    //todo - controllare se ci sono abbastanza carte per pescare
    fetch("https://www.deckofcardsapi.com/api/deck/"+deckID+"/draw/?count="+count)
    .then((res) => res.json())
    .then((data) => {
      if (data.cards) {

        setTable((prevTable) => [...prevTable, ...data.cards]);
        setRemaining(data.remaining)

        socket.emit('dealCards', data.cards, data.remaining, room);
      }
    })
  }

  const drawCards = async (count=3) => {
    //todo - controllare se ci sono abbastanza carte per pescare
    await fetch("https://www.deckofcardsapi.com/api/deck/"+deck+"/draw/?count="+count)
    .then((res) => res.json())
    .then((data) => {
      if (data.cards) {
        setHand((prevHand) => [...prevHand, ...data.cards]);
        setRemaining(data.remaining)

        socket.emit('playerDraw', count, data.remaining, room);
      }
    })
  }

  const getValueOfCard = (card) => {
    if (card[0] === "A")
      return '1'
    else if (card[0] === "J")
      return '8'
    else if (card[0] === "Q")
      return '9'
    else if (card[0] === "K")
      return '10'
    return card[0];
  }

  const playerMove = async () => {
    //Controllare se la mossa è valida --> TODO
    //Se è valida - aggiungo le carte alla pila

    let moveIsValid = false;

    if (selectedTableCard.length > 0) {
      const cardsTaken = selectedCard+","+selectedTableCard.join(",")
      const cardsTakenArray = cardsTaken.split(",")

      const playedCard = cardsTakenArray.shift()
      
      if (cardsTakenArray.length === 1) {
        if (getValueOfCard(playedCard) === getValueOfCard(cardsTakenArray[0]))
          moveIsValid = true
        else
          moveIsValid = false
      }
      else {
        let sumOfCardsTaken = 0

        for (let i=0; i<cardsTakenArray.length; i++)
          sumOfCardsTaken += parseInt(getValueOfCard(cardsTakenArray[i]))

        console.debug(sumOfCardsTaken)
      }

      if (!moveIsValid) return moveIsValid;

      await fetch("https://www.deckofcardsapi.com/api/deck/"+deck+"/pile/"+playerID+"_pile/add/?cards="+cardsTaken)
      .then((res) => res.json())
      .then((data) => {
        if (data.piles[playerID+"_pile"]) {
  
          const newTable = table.filter(x => x.code != selectedTableCard)
  
          setHand(
            hand.filter(x => x.code != selectedCard)
          )
  
          setTable(newTable)
  
          setSelectedCard("")
          setSelectedTableCard([])
  
          socket.emit('playerMove', cardsTaken, newTable, room);

          return moveIsValid;
        }
      })
    }
    else {
      setHand(
        hand.filter(x => x.code != selectedCard)
      )

      const playedCard =  hand.filter(x => x.code == selectedCard)
      const newTable = [...table, ...playedCard]

      setSelectedCard("")
      setTable((prevTable) => [...prevTable, ...playedCard]);

      socket.emit('playerMove', "", newTable, room);

      return moveIsValid;
    }
  }

  const getPlayersInRoom = () => {
    return new Promise((resolve, reject) => {
      socket.emit('getPlayersInRoom', room, (response) => {
        if (response) {
          resolve(response.count);
        }
      });
    });
  };

  const fetchPlayersInRoom = async () => {
    try {
      const count = await getPlayersInRoom(room);
      return count
    } catch (error) {
      console.error('Errore nel caricamento del conteggio:', error);
    }
  };


  return (
    <div className="app">
      
      {!mode &&
        <>
          <JoinRoomForm
            setRoom={setRoom}
            setMode={setMode}
          />
        </>
      }

      {playerID &&
        <>
          <p>Room: {room}</p>
          {/*<p>Your ID is: {playerID}</p>*/}
        </>
      }

      {room &&
        <>
          {/*
            <p>Giocatori connessi nella room {room}:</p>
            <ul>
              {players.map((player) => (
                <li key={player} style={{ fontWeight: player === currentTurn ? 'bold' : 'normal' }}>
                  {player} {player === currentTurn ? '(di turno)' : ''}
                </li>
              ))}
            </ul>
          */}

          {isMyTurn ? (
            <div>
              <h3>It's your turn!</h3>
              {/*<button onClick={() => endTurn()}>Termina turno</button>*/}
            </div>
          ) : (
            <h3>Waiting for the opponent...</h3>
          )}
        </>
      }

      {(!deck && mode && (!cardsDealt && isMyTurn)) &&
        <button onClick={() => getDeck()}>Deal cards</button>
      }

      {deck &&
        <>
          <p>Cards in opponent's hand: {opponentsHand}</p>

          <Deck 
            remaining={remaining}
          />
          <p>Table</p>
          <Table
            cards={table}
            selectedTableCard={selectedTableCard}
            setSelectedTableCard={setSelectedTableCard}
          />
        </>
      }

      {(deck && hand.length <= 0 && isMyTurn) &&
        <>
          <button onClick={async () => {
            await drawCards()
            endTurn()
          }}>Draw cards</button>
        </>
      }

      {hand.length > 0 &&
        <>
          <p>Player's hand</p>
          <Hand
            cards={hand}
            selectedCard={selectedCard}
            setSelectedCard={setSelectedCard}
          />

          <br/>

          {(selectedCard && isMyTurn) &&
            <button onClick={async () => {
              if (await playerMove())
                endTurn()
              else
                console.debug("La mossa non è valida riprovare.")
            }}>Make move</button>
          }
        </>
      }
    </div>
  )
}

export default App;