import { useEffect } from 'react'

import { useBaseState } from './utils/useBaseState'
import { useOfflineState } from './utils/useOfflineState'
import { useOnlineState } from './utils/useOnlineState'
import { useBeforeUnloadEffect } from './utils/useBeforeUnloadEffect'
import { getValueOfCard, checkTris, checkLess10, check15or30, grandeCondition, getRandomIntInclusive, checkCombinationFor15, piccolaCondition, computePrimiera } from './utils/utils'

import io from 'socket.io-client'

import Hand from './components/Hand'
import Table from './components/Table'
import OpponentHand from './components/OpponentHand'
import JoinRoomForm from './components/JoinRoomForm'
import DisplayScore from './components/DisplayScore'

import './App.css'


function App() {
  const server = "https://ciapachinze.onrender.com";
  //const server = "http://localhost:3000";

  const deckCards = "AS,AD,AC,AH,2S,2D,2C,2H,3S,3D,3C,3H,4S,4D,4C,4H,5S,5D,5C,5H,6S,6D,6C,6H,7S,7D,7C,7H,JS,JD,JC,JH,QS,QD,QC,QH,KS,KD,KC,KH";
  //const deckCards = "AS,AD,3D,KH,2D,2C,3H,3S,5D,7D";

  const {
    mode,
    setMode,
    gameIsOver,
    setGameIsOver,
    isMyTurn,
    setIsMyTurn,
    cardsDealt,
    setCardsDealt,
    deck,
    setDeck,
    hand,
    setHand,
    table,
    setTable,
    remaining,
    setRemaining,
    opponentsHand,
    setOpponentsHand,
    opponentPlayedCards,
    setOpponentPlayedCards,
    resetOpponentHand,
    setResetOpponentHand,
    selectedCard,
    setSelectedCard,
    selectedTableCard,
    setSelectedTableCard,
    scope,
    setScope,
    opponentScope,
    setOpponentScope,
    finalScore,
    setFinalScore,
    opponentFinalScore,
    setOpponentFinalScore,
    isLastToTake,
    setIsLastToTake,
    canDraw,
    setCanDraw,
    canPlay,
    setCanPlay
  } = useBaseState();

  const {
    socket,
    setSocket,
    room,
    setRoom,
    rooms,
    setRooms,
    players,
    setPlayers,
    currentTurn,
    setCurrentTurn,
    playerID,
    setPlayerID
  } = useOnlineState();

  const {
    botHand,
    setBotHand
  } = useOfflineState();

  useBeforeUnloadEffect();
  

  /* BOT LOGIC */
  useEffect(() => {
    const getDeckOffline = async () => { await getDeck(); setCardsDealt(true) }

    if (mode === "single" && !deck) getDeckOffline()
  }, [mode])

  useEffect(() => {
    const botDraw = async () => { await botDrawCards() }
    const botMove = async () => { await botMakeMove() }

    if (!isMyTurn && mode === "single") {
        if (botHand.length <= 0) {
          if (cardsDealt) {
            setTimeout(() => {
              botDraw()
              setIsMyTurn(true)
            }, getRandomIntInclusive(700, 1500))
          }
          else
            setIsMyTurn(true)
        }
        else {
          setTimeout(() => {
            botMove()
            setIsMyTurn(true)
          }, getRandomIntInclusive(1000, 2000))
        }  
    }
  }, [isMyTurn])
  /* END BOT LOGIC */
    

  useEffect(() => {
    if (mode === "multi") {
      const newSocket = io(server);

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

        setSelectedTableCard([])

        setTable(newTable)
      });
      
      newSocket.on('trisOrLess10', (cards) => {
        setResetOpponentHand(false)
        setOpponentPlayedCards(cards)
      });

      newSocket.on('is15or30', (remaining) => {
        setRemaining(remaining)
      });

      newSocket.on('playerDraw', (count, remaining) => {
        //console.log("L'avversario ha pescato:", count, "carte rimanenti nel mazzo:", remaining);
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

      newSocket.on('playerScore', (cards, diamonds, scope, settebello, piccola, grande, primiera) => {
        setOpponentFinalScore({
          cards: cards,
          diamonds: diamonds,
          scope: scope,
          settebello: settebello,
          piccola: piccola,
          grande: grande,
          primiera: primiera
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
        newSocket.off('is15or30');
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
    //console.debug("Selected card:", selectedCard)
  }, [selectedCard])

  useEffect(() => {
    //console.debug("Selected table cards:", selectedTableCard)
  }, [selectedTableCard])

  useEffect(() => {
    if (socket) {
      //console.debug("Player hand:", hand)
  
      socket.emit("handUpdate", hand.length, room)
    }
  }, [hand])

  useEffect(() => {
    //console.debug("Bot hand:", botHand)
  }, [botHand])

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
    if (mode === "multi")
      endTurn()
  }, [cardsDealt]);

  useEffect(() => {
    if (remaining <= 0 && hand.length === 0 && opponentsHand === 0 && !gameIsOver) {
      if (mode === "single") {
        if (botHand.length === 0)
          setGameIsOver(true)
      }
      else setGameIsOver(true)
    }
  }, [remaining, hand, opponentsHand, botHand]);

  useEffect(() => {
    if (gameIsOver)
      computeScore()

    if (mode === "single")
      computeScore(true)
  }, [gameIsOver]);


  const endTurn = () => {
    if (mode === "multi") {
      if (isMyTurn && socket)
        socket.emit('endTurn', room);
    }
    else if (mode === "single") {
      if (isMyTurn)
        setIsMyTurn(false)
    }
  };

  const getDeck = async () => {
    let playerCount = 0
    if (mode === "multi")
      playerCount = await fetchPlayersInRoom()

    if (playerCount === 2 || mode === "single") {
      fetch("https://www.deckofcardsapi.com/api/deck/new/shuffle/?cards="+deckCards)
      .then((res) => res.json())
      .then(async (data) => {
        if (data.deck_id) {
          setDeck(data.deck_id)
          
          await dealCards(4, data.deck_id)

          if (mode === "multi") socket.emit('deckID', data.deck_id, room);

          setCardsDealt(true)
        }
      })
    }
  }

  const dealCards = async (count=4, deckID) => {
    fetch("https://www.deckofcardsapi.com/api/deck/"+deckID+"/draw/?count="+count)
    .then((res) => res.json())
    .then(async (data) => {
      if (data.cards) {

        setTable((prevTable) => [...prevTable, ...data.cards]);
        setRemaining(data.remaining)

        const is15or30 = check15or30(data.cards)

        // WORKAROUND -> NON BELLO
        if (is15or30 == 15 || is15or30 == 30) {
          if (is15or30 == 15)
            setScope(prev => prev)
          else if (is15or30 == 30)
            setScope(prev => prev+1)

          const tableCards = data.cards.map(card => card.code);
          const tableCardsTaken = tableCards.join(",")

          if (mode === "multi") socket.emit('is15or30', data.remaining, room)

          await addToPile(tableCardsTaken, tableCards, deckID)
        }
        else
          if (mode === "multi") socket.emit('dealCards', data.cards, data.remaining, room);
      }
    })
  }

  const drawCards = async (count=3) => {
    if (remaining-count >= 0) {

      setCanDraw(false)

      await fetch("https://www.deckofcardsapi.com/api/deck/"+deck+"/draw/?count="+count)
      .then((res) => res.json())
      .then((data) => {
        if (data.cards) {
          setHand((prevHand) => [...prevHand, ...data.cards]);
          setRemaining(data.remaining)

          // se è il giocatore 1 resetto sempre
          if (resetOpponentHand || (mode === "multi" && players[1].replaceAll("-", "") == playerID))
            setOpponentPlayedCards([])
          else
            setResetOpponentHand(true)
          
          if (checkTris(data.cards)) {
            setScope(prev => prev+10)
            if (mode === "multi") socket.emit('trisOrLess10', data.cards, room)
          }
  
          if (checkLess10(data.cards)) {
            setScope(prev => prev+3)
            if (mode === "multi") socket.emit('trisOrLess10', data.cards, room)
          }
  
          if (mode === "multi") socket.emit('playerDraw', count, data.remaining, room);

          setCanDraw(true)
        }
      })
    }
  }

  const addToPile = async (cardsTaken, selectedTableCards, deck_id=deck) => {
    let pile_name = playerID ? playerID : "player_"+deck_id

    return fetch("https://www.deckofcardsapi.com/api/deck/"+deck_id+"/pile/"+pile_name+"_pile/add/?cards="+cardsTaken)
    .then((res) => res.json())
    .then(async (data) => {
      if (data.piles[pile_name+"_pile"]) {

        const newTable = table.filter(x => !selectedTableCards.includes(x.code))

        if (newTable.length == 0)
          setScope(prev => prev+1)

        setHand(
          hand.filter(x => x.code != selectedCard)
        )

        setTable(newTable)

        setSelectedCard("")
        setSelectedTableCard([])

        if (mode === "multi") socket.emit('playerMove', {code: selectedCard}, cardsTaken, newTable, room);

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

    if (mode === "multi") socket.emit('playerMove', playedCard[0], "", newTable, room);

    // la mossa è sempre valida
    return true;
  }

  const playerMove = async () => {
    
    setCanPlay(false)

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
        if (getValueOfCard(playedCard) === getValueOfCard(cardsTakenArray[0]) || parseInt(getValueOfCard(playedCard)) + parseInt(getValueOfCard(cardsTakenArray[0])) === 15)
          moveIsValid = true
        else
          moveIsValid = false
      }
      else {
        let sumOfCardsTaken = 0

        for (let i=0; i<cardsTakenArray.length; i++)
          sumOfCardsTaken += parseInt(getValueOfCard(cardsTakenArray[i]))

        if (sumOfCardsTaken === parseInt(getValueOfCard(playedCard)) || (sumOfCardsTaken + parseInt(getValueOfCard(playedCard)) === 15))
          moveIsValid = true
        else
          moveIsValid = false
      }

      if (!moveIsValid) return moveIsValid;

      return await addToPile(cardsTaken, selectedTableCard)

    }
    else
      return addCardToTable()
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

  const computeScore = async (isBot=false) => {
    const tableCards = table.map(card => card.code);
    if (isLastToTake) {
      const tableCardsTaken = tableCards.join(",") // watch out - prima era così: selectedCard+","+tableCards.join(",")

      await addToPile(tableCardsTaken, tableCards)
    }
    else if (isBot) {
      const tableCardsTaken = tableCards.join(",") // watch out - prima era così: botHand[0].code+","+tableCards.join(",")

      await botAddToPile(tableCardsTaken, tableCards)
    }

    let pile_name = playerID ? playerID : (isBot ? "bot_"+deck : "player_"+deck)

    return fetch("https://www.deckofcardsapi.com/api/deck/"+deck+"/pile/"+pile_name+"_pile/list/")
    .then((res) => res.json())
    .then((data) => {
      if (data.piles[pile_name+"_pile"]) {
        const pile = data.piles[pile_name+"_pile"].cards
  
        //compute diamonds
        let diamonds = 0
        let settebello = false

        let piccola = false
        let grande = false

        let primiera = 0

        for (const card of pile) {
          if (card.code === "7D")
            settebello = true
          if (card.code[1] === "D")
            diamonds++
        }
        
        grande = grandeCondition.every(condition => pile.some(card => card.code === condition))

        let ind = -1
        for (let i = 0; i < piccolaCondition.length; i++) {
            const condition = piccolaCondition[i]
            const match = pile.some(card => card.code === condition)

          if (!match)
            break
          ind = i
        }

        piccola = ind >= 2 ? ind : false

        primiera = computePrimiera(pile)

        if (isBot) {
          setOpponentFinalScore({
            cards: pile.length,
            diamonds: diamonds,
            scope: opponentScope,
            settebello: settebello,
            piccola: piccola,
            grande: grande,
            primiera: primiera
          })
        }
        else {
          setFinalScore({
            cards: pile.length,
            diamonds: diamonds,
            scope: scope,
            settebello: settebello,
            piccola: piccola,
            grande: grande,
            primiera: primiera
          })
        }
  
        if (mode === "multi") socket.emit("playerScore", pile.length, diamonds, scope, settebello, piccola, grande, primiera, room)
      }
      else {
        if (isBot) {
          setOpponentFinalScore({
            cards: 0,
            diamonds: 0,
            scope: 0,
            settebello: false,
            piccola: false,
            grande: false,
            primiera: 0
          })
        }
        else {
          setFinalScore({
            cards: 0,
            diamonds: 0,
            scope: 0,
            settebello: false,
            piccola: false,
            grande: false,
            primiera: 0
          })
        }
  
        if (mode === "multi") socket.emit("playerScore", 0, 0, 0, false, false, false, 0, room)
      }

      if (!isBot) window.alert("Game is over!")
    });
  }


  /* BOT FUNCTIONS */
  const botDrawCards = async (count=3) => {
    if (remaining-count >= 0) {

      await fetch("https://www.deckofcardsapi.com/api/deck/"+deck+"/draw/?count="+count)
      .then((res) => res.json())
      .then((data) => {
        if (data.cards) {

          setBotHand((prevHand) => [...prevHand, ...data.cards]);
          setRemaining(data.remaining)

          if (checkTris(data.cards)) {
            setOpponentScope(prev => prev+10)
            setOpponentPlayedCards(data.cards)
          }
  
          if (checkLess10(data.cards)) {
            setOpponentScope(prev => prev+3)
            setOpponentPlayedCards(data.cards)
          }
        }
      })
    }
  }

  const botAddCard = (botSelectedCard) => {
    setBotHand(
      botHand.filter(x => x.code != botSelectedCard)
    )

    const playedCard = botHand.filter(x => x.code == botSelectedCard)

    setTable((prevTable) => [...prevTable, ...playedCard]);

    // la mossa è sempre valida
    return true;
  }

  const botTakeCard = async (botPlayedCard, botSelectedTableCard) => {
    const cardsTaken = botPlayedCard+","+botSelectedTableCard.join(",")

    return await botAddToPile(cardsTaken, botSelectedTableCard)
  }

  const botAddToPile = async (cardsTaken, selectedTableCards) => {
    return fetch("https://www.deckofcardsapi.com/api/deck/"+deck+"/pile/bot_"+deck+"_pile/add/?cards="+cardsTaken)
    .then((res) => res.json())
    .then(async (data) => {
      if (data.piles["bot_"+deck+"_pile"]) {

        const newTable = table.filter(x => !selectedTableCards.includes(x.code))

        if (newTable.length == 0)
          setOpponentScope(prev => prev+1)

        const cardsTakenArray = cardsTaken.split(",")
        const botSelectedCard = cardsTakenArray.shift()

        setBotHand(
          botHand.filter(x => x.code != botSelectedCard)
        )

        setTable(newTable)

        setIsLastToTake(false)

        return true;
      }
    })
  }

  const botChooseCardToPlay = () => {
    const tableCards = table.map(card => card.code)
    const botCards = botHand.map(card => card.code)

    if (table.length <= 0)
      return [botCards[0], ""]

    const aceInTable = table.some(card => card.code[0] === "A")
    const sumOfTable = tableCards.reduce((acc, card) => { return acc + parseInt(getValueOfCard(card)) }, 0)

    // posso fare scopa
    for (const card of botCards) {
      if (sumOfTable < 15) {
        if (parseInt(getValueOfCard(card)) + sumOfTable === 15 || parseInt(getValueOfCard(card)) === sumOfTable)
          return [card, tableCards]
      }
    }

    //faccio scopa con l'asso
    for (const card of botCards) {
      if (card[0] === 'A' && !aceInTable) {
        return [card, tableCards]
      }
    }

    // posso fare 15 con più carte
    for (const card of botCards) {
      const combinationFor15 = checkCombinationFor15(tableCards, parseInt(getValueOfCard(card)))
      if (combinationFor15 && combinationFor15.length > 0)
        return [card, combinationFor15]
    }

    // trovo carta uguale o faccio 15 con una carta
    for (const card of botCards) {
      const validTableCard = tableCards.find(tableCard => ( getValueOfCard(tableCard) === getValueOfCard(card) || parseInt(getValueOfCard(tableCard)) + parseInt(getValueOfCard(card)) === 15 ))
      if (validTableCard)
        return [card, [validTableCard]]
    }

    //caso base -> non posso prendere niente dal tavolo
    return [botCards[0], ""]
  }

  const botMakeMove = async () => {
    const botDecision = botChooseCardToPlay()

    if (botDecision[1]) {
      await botTakeCard(botDecision[0], botDecision[1])
      setIsLastToTake(false)
    }
    else
      botAddCard(botDecision[0])

    setOpponentPlayedCards((lastPlayedCards) => {
      if (lastPlayedCards.length+1 <= 3)
        return [...lastPlayedCards, botHand.find(card => card.code === botDecision[0])]
      else return lastPlayedCards
    })

    setSelectedTableCard([])
  } 
  /* END BOT FUNCTIONS */


  return (
    <div className="app">
      
      {!mode &&
        <>
          <br/>

          <button onClick={() => setMode("single")}>Play offline</button>
          {" "}
          <button onClick={() => setMode("multi")}>Play online</button>

          <br/>
          <br/>

          <a href='https://it.wikipedia.org/wiki/Cirulla' target='_blank'>Click here to check the rules</a>
        </>
      }

      {(mode === "multi" && !room) &&
        <JoinRoomForm
          setRoom={setRoom}
          rooms={rooms}
        />
      }

      {(gameIsOver && Object.keys(finalScore).length > 0 && Object.keys(opponentFinalScore).length > 0) &&
        <DisplayScore
          finalScore={finalScore}
          opponentFinalScore={opponentFinalScore}
        />
      }

      {!gameIsOver &&
        <>
          {(playerID && room) &&
            <>
              <p className='room'>Room: {room}</p>

              { isMyTurn ? <h3 className='turn-message'>It's your turn!</h3> : <h3 className='wait-message dots'>Waiting for the opponent</h3> }

              { !deck && players.map((player, key) => {
                return (
                  <li key={key}>
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

              {mode === "single" &&
                <>
                  { isMyTurn ? <h3 className='turn-message'>It's your turn!</h3> : <h3 className='wait-message dots'>Waiting for the opponent</h3> }
                </>
              }

              <OpponentHand
                playedCards={opponentPlayedCards}
              />

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
              <button disabled={!canDraw} onClick={async () => {
                await drawCards()
                endTurn()
              }}>Draw cards</button>
            </>
          }

          {hand.length > 0 &&
            <div>
              <p>Player's hand</p>
              <Hand
                cards={hand}
                selectedCard={selectedCard}
                setSelectedCard={setSelectedCard}
              />

              {(selectedCard && isMyTurn) &&
                <>
                  <br/>
                  <button disabled={!canPlay} onClick={async () => {
                    const moveIsValid = await playerMove()
                    if (moveIsValid)
                      endTurn()
                    else
                      console.debug("La mossa non è valida riprovare.")

                    setCanPlay(true)

                  }}>
                    {selectedTableCard.length <= 0 ? "Add to the table" : "Take cards"}
                  </button>
                </>
              }
            </div>
          }

          {deck &&
            <div>
              <br/>
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