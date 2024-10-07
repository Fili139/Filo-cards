import { useState, useEffect } from 'react'

import Hand from './components/Hand'
import Deck from './components/Deck'
import OpponentHand from './components/OpponentHand'
import JoinRoomForm from './components/JoinRoomForm'
import DisplayScore from './components/DisplayScore'

import { handleBeforeUnload, getValueOfCard, checkTris, checkLess10, check15or30 } from './utils'

import io from 'socket.io-client'

import './App.css'
import Table from './components/Table'


function App() {
  const deckCards = "AS,AD,AC,AH,2S,2D,2C,2H,3S,3D,3C,3H,4S,4D,4C,4H,5S,5D,5C,5H,6S,6D,6C,6H,7S,7D,7C,7H,JS,JD,JC,JH,QS,QD,QC,QH,KS,KD,KC,KH";
  //const deckCards = "AS,AD,3D,KH,2D,2C,2H,3S,4D,3C";

  const [gameIsOver, setGameIsOver] = useState(false);

  const [socket, setSocket] = useState(null);

  const [room, setRoom] = useState("");
  const [rooms, setRooms] = useState([]);

  const [players, setPlayers] = useState([]);
  const [currentTurn, setCurrentTurn] = useState("");
  const [isMyTurn, setIsMyTurn] = useState(false);

  const [playerID, setPlayerID] = useState("");
  
  const [cardsDealt, setCardsDealt] = useState(false);

  const [mode, setMode] = useState(""); 

  const [deck, setDeck] = useState("");
  const [hand, setHand] = useState([]);
  const [table, setTable] = useState([]);
  const [remaining, setRemaining] = useState(52);
  
  const [opponentsHand, setOpponentsHand] = useState(0);
  const [opponentPlayedCards, setOpponentPlayedCards] = useState([]);
  const [resetOpponentHand, setResetOpponentHand] = useState(true);

  const [selectedCard, setSelectedCard] = useState("");
  const [selectedTableCard, setSelectedTableCard] = useState([]);
  
  const [scope, setScope] = useState(0);
  const [opponentScope, setOpponentScope] = useState(0);

  const [finalScore, setFinalScore] = useState({});
  const [opponentFinalScore, setOpponentFinalScore] = useState({});

  const [isLastToTake, setIsLastToTake] = useState(false);


  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (mode === "multi") {
      const newSocket = io('https://ciapachinze.onrender.com');
      //const newSocket = io('http://localhost:3000');

      setSocket(newSocket);
      
      newSocket.emit("getRooms")
      
      newSocket.on('getRooms', (rooms) => {
        setRooms(rooms)
      });

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
      
      newSocket.on('playerMove', (played_card, cards_taken, newTable) => {
        if (played_card.code) {
          setOpponentPlayedCards((lastPlayedCards) => {
            if (lastPlayedCards.length+1 <= 3)
              return [...lastPlayedCards, played_card]
            else return lastPlayedCards
          })
        }

        if (cards_taken)
          setIsLastToTake(false)

        setTable(newTable)
      });
      
      newSocket.on('trisOrLess10', (cards) => {
        setResetOpponentHand(false)
        setOpponentPlayedCards(cards)
      });

      newSocket.on('playerDraw', (count, remaining) => {
        console.log("L'avversario ha pescato:", count, "carte rimanenti nel mazzo:", remaining);

        setRemaining(remaining)
      });
  
      newSocket.on('handUpdate', (handCount) => {
        setOpponentsHand(handCount)
      });
  
      newSocket.on('dealCards', (table_cards, remaining) => {
        setTable(table_cards);
        setRemaining(remaining)
      });

      newSocket.on('scopeUpdate', (opponent_scope) => {
        setOpponentScope(opponent_scope)
      });

      newSocket.on('playerScore', (cards, diamonds, scope, settebello, piccola, grande) => {
        setOpponentFinalScore({
          cards: cards,
          diamonds: diamonds,
          scope: scope,
          settebello: settebello,
          piccola: piccola,
          grande: grande
        })
      });
  
      // Funzione di pulizia: disconnetti il socket quando il componente si smonta
      return () => {
        newSocket.off('yourID');
        newSocket.off('deckID');
        newSocket.off('playersUpdate');
        newSocket.off('turnUpdate');
        newSocket.off('playerMove');
        newSocket.off('trisOrLess10');
        newSocket.off('playerDraw');
        newSocket.off('handUpdate');
        newSocket.off('dealCards');
        newSocket.off('scopeUpdate');
        newSocket.off('playerScore');
  
        newSocket.disconnect();
      };
    }
  }, [mode])

  useEffect(() => {
    if (socket)
      socket.emit('joinRoom', room);
  }, [room])

  useEffect(() => {
    console.debug("Selected card:", selectedCard)
  }, [selectedCard])

  useEffect(() => {
    console.debug("Selected table cards:", selectedTableCard)
  }, [selectedTableCard])

  useEffect(() => {
    if (socket) {
      console.debug("Player hand:", hand)
  
      socket.emit("handUpdate", hand.length, room)
    }
  }, [hand])

  useEffect(() => {
    if (table.length > 0)
      console.debug("Table:", table)

  }, [table])

  useEffect(() => {
    setIsMyTurn(playerID === currentTurn.replaceAll("-", ""));
  }, [playerID, currentTurn]);

  useEffect(() => {
    if (socket) {
      socket.emit("scopeUpdate", scope, room)
    }
  }, [scope]);

  useEffect(() => {
    if (remaining <= 0 && hand.length === 0 && opponentsHand === 0 && !gameIsOver)
      setGameIsOver(true)
  }, [remaining, hand, opponentsHand]);

  useEffect(() => {
    if (gameIsOver)
      computeScore()
  }, [gameIsOver]);
  

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
    .then(async (data) => {
      if (data.cards) {

        setTable((prevTable) => [...prevTable, ...data.cards]);
        setRemaining(data.remaining)

        const is15or30 = check15or30(data.cards)

        if (is15or30 == 15 || is15or30 == 30) {
          if (is15or30 == 15)
            setScope(prev => prev+1)
          else if (is15or30 == 30)
            setScope(prev => prev+2)

          const tableCards = table.map(card => card.code);
          const tableCardsTaken = selectedCard+","+tableCards.join(",")

          await addToPile(tableCardsTaken, tableCards, deckID)
        }

        socket.emit('dealCards', data.cards, data.remaining, room);
      }
    })
  }

  const drawCards = async (count=3) => {
    if (remaining-count >= 0) {
      await fetch("https://www.deckofcardsapi.com/api/deck/"+deck+"/draw/?count="+count)
      .then((res) => res.json())
      .then((data) => {
        if (data.cards) {
          setHand((prevHand) => [...prevHand, ...data.cards]);
          setRemaining(data.remaining)

          // se è il giocatore 1 resetto sempre
          if (resetOpponentHand || players[0].replaceAll("-", "") == playerID)
            setOpponentPlayedCards([])
          else
            setResetOpponentHand(true)
          
          if (checkTris(data.cards)) {
            setScope(prev => prev+10)
            socket.emit('trisOrLess10', data.cards, room)
          }
  
          if (checkLess10(data.cards)) {
            setScope(prev => prev+3)
            socket.emit('trisOrLess10', data.cards, room)
          }
  
          socket.emit('playerDraw', count, data.remaining, room);
        }
      })
    }
  }

  const addToPile = async (cardsTaken, selectedTableCards, deck_id=deck) => {
    return fetch("https://www.deckofcardsapi.com/api/deck/"+deck_id+"/pile/"+playerID+"_pile/add/?cards="+cardsTaken)
    .then((res) => res.json())
    .then(async (data) => {
      if (data.piles[playerID+"_pile"]) {

        const newTable = table.filter(x => !selectedTableCards.includes(x.code))

        if (newTable.length == 0)
          setScope(prev => prev+1)

        setHand(
          hand.filter(x => x.code != selectedCard)
        )

        setTable(newTable)

        setSelectedCard("")
        setSelectedTableCard([])

        socket.emit('playerMove', {code: selectedCard}, cardsTaken, newTable, room);

        setIsLastToTake(true)

        return true;
      }
    })
  }

  const addCardToTable = () => {
    setHand(
      hand.filter(x => x.code != selectedCard)
    )

    const playedCard = hand.filter(x => x.code == selectedCard)

    const newTable = [...table, ...playedCard]

    setSelectedCard("")
    setTable((prevTable) => [...prevTable, ...playedCard]);

    socket.emit('playerMove', playedCard[0], "", newTable, room);

    // la mossa è sempre valida
    return true;
  }

  const playerMove = async () => {
    let moveIsValid = false;

    // gestione asso
    if (selectedCard[0] === "A") {
      const tableCards = table.map(card => card.code);
      const tableCardsTaken = selectedCard+","+tableCards.join(",")

      const aceInTable = table.some(card => card.code[0] === "A")

      if (selectedTableCard.length == 0) {
        if (aceInTable)
          return false
        else {
          if (table.length > 0)
            return await addToPile(tableCardsTaken, tableCards)
          else
            return addCardToTable()
        }
      }
      else {
        const cardsTaken = selectedCard+","+selectedTableCard.join(",")
        const cardsTakenArray = cardsTaken.split(",")

        cardsTakenArray.shift()

        if (aceInTable) {
          if (!cardsTakenArray.some(card => card[0] === "A"))
            return false
          else
            return await addToPile(cardsTaken, selectedTableCard)
        }
        else 
          return await addToPile(cardsTaken, tableCards)
      }
    }
    // fine gestione asso

    if (selectedTableCard.length > 0) {
      const cardsTaken = selectedCard+","+selectedTableCard.join(",")
      const cardsTakenArray = cardsTaken.split(",")

      const playedCard = cardsTakenArray.shift()

      if (cardsTakenArray.length === 1) {
        if (getValueOfCard(playedCard) === getValueOfCard(cardsTakenArray[0]) || parseInt(getValueOfCard(playedCard)) + parseInt(getValueOfCard(cardsTakenArray[0])) == 15)
          moveIsValid = true
        else
          moveIsValid = false
      }
      else {
        let sumOfCardsTaken = 0

        for (let i=0; i<cardsTakenArray.length; i++)
          sumOfCardsTaken += parseInt(getValueOfCard(cardsTakenArray[i]))

        if (sumOfCardsTaken == getValueOfCard(playedCard) || (sumOfCardsTaken + parseInt(getValueOfCard(playedCard)) == 15))
          moveIsValid = true
        else
          moveIsValid = false
      }

      if (!moveIsValid) return moveIsValid;

      return await addToPile(cardsTaken, selectedTableCard)

    }
    else {
      return addCardToTable()
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

  const computeScore = async () => {
    if (isLastToTake) {
      const tableCards = table.map(card => card.code);
      const tableCardsTaken = selectedCard+","+tableCards.join(",")

      await addToPile(tableCardsTaken, tableCards)
    }

    return fetch("https://www.deckofcardsapi.com/api/deck/"+deck+"/pile/"+playerID+"_pile/list/")
    .then((res) => res.json())
    .then((data) => {
      if (data.piles[playerID+"_pile"]) {
        const pile = data.piles[playerID+"_pile"].cards
  
        //compute diamonds
        let diamonds = 0
        let settebello = false
        let piccola = false
        let grande = false
        for (const card of pile) {
          if (card.code === "7D")
            settebello = true
          if (card.code[1] === "D")
            diamonds++
        }
        
        const grandeCondition = ["QD", "JD", "KD"]
        grande = grandeCondition.every(condition => pile.some(card => card.code === condition))

        const piccolaCondition = ["AD", "2D", "3D", "4D", "5D", "6D", "7D"]
        let ind = -1
        for (let i = 0; i < piccolaCondition.length; i++) {
            const condition = piccolaCondition[i]
            const match = pile.some(card => card.code === condition)

          if (!match)
              break
          ind = i
        }

        piccola = ind >= 2 ? ind : false

        setFinalScore({
          cards: pile.length,
          diamonds: diamonds,
          scope: scope,
          settebello: settebello,
          piccola: piccola,
          grande: grande
        })
  
        socket.emit("playerScore", pile.length, diamonds, scope, settebello, piccola, grande, room)
      }
      else {
        setFinalScore({
          cards: 0,
          diamonds: 0,
          scope: 0,
          settebello: false,
          piccola: false,
          grande: false
        })
  
        socket.emit("playerScore", 0, 0, 0, false, false, false, room)
      }

      window.alert("Game is over!")
    });
  }


  return (
    <div className="app">
      
      {!mode &&
        <>
          <br/>

          <button onClick={() => setMode("multi")}>Play!</button>

          <br/>
          <br/>

          <a href='https://it.wikipedia.org/wiki/Cirulla' target='_blank'>Click here to check the rules</a>
        </>
      }

      {(mode && !room) &&
        <JoinRoomForm
          setRoom={setRoom}
          rooms={rooms}
        />
      }

      {gameIsOver &&
        <DisplayScore
          finalScore={finalScore}
          opponentFinalScore={opponentFinalScore}
        />
      }

      {!gameIsOver &&
        <>
          {(playerID && room) &&
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

              { isMyTurn ? <h3>It's your turn!</h3> : <h3>Waiting for the opponent...</h3> }
              { !deck && players.map(player => {
                return (
                  <li>
                    {player} {player.replaceAll("-", "") === playerID ? '(you)' : ''}
                  </li>  
                )
              })}

              {!deck && isMyTurn && !cardsDealt &&
                <>
                  <br/>
                  {players.length === 2 ?
                    <button onClick={() => getDeck()}>Deal cards</button>
                  :
                    <p>2 players needed to start the game</p>
                  }
                </>
              }
            </>
          }

          {deck &&
            <>
              <OpponentHand
                playedCards={opponentPlayedCards}
              />

              {/*
                <Deck 
                  remaining={remaining}
                />
              */}

              <div>
                Cards remaining: {remaining}
              </div>

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
              <br/>
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

              {(selectedCard && isMyTurn) &&
                <>
                  <br/>
                  <button onClick={async () => {
                    const moveIsValid = await playerMove()
                    if (moveIsValid)
                      endTurn()
                    else
                      console.debug("La mossa non è valida riprovare.")
                  }}>
                    {selectedTableCard.length <= 0 ? "Add to the table" : "Take cards"}
                  </button>
                </>
              }
            </>
          }

          {deck &&
            <div>
              Scope: {scope}
              <br/>
              Opponent's scope: {opponentScope}
            </div>
          }
        </>
      }

      
    </div>
  )
}

export default App;