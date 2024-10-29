import { useEffect } from 'react'

import toast, { Toaster } from 'react-hot-toast';

import { useBaseState } from './utils/useBaseState'
import { useOfflineState } from './utils/useOfflineState'
import { useOnlineState } from './utils/useOnlineState'
import { useBeforeUnloadEffect } from './utils/useBeforeUnloadEffect'
import { getValueOfCard, checkTris, checkLess10, getCardsSum, grandeCondition, getRandomIntInclusive, getMattaOptions, checkCombinationFor15, piccolaCondition, computePrimiera } from './utils/utils'

import io from 'socket.io-client'

import Landing from './components/Landing'
import Hand from './components/Hand'
import Table from './components/Table'
import OpponentHand from './components/OpponentHand'
import ChooseNameForm from './components/ChooseNameForm'
import JoinRoomForm from './components/JoinRoomForm'
import ChooseGameTypeForm from './components/ChooseGameTypeForm'
import DisplayScore from './components/DisplayScore'

import './App.css'


function App() {
  const server = "https://ciapachinze.onrender.com";
  //const server = "http://localhost:3000";

  const version = "1.0.0"

  const deckCards = "AS,AD,AC,AH,2S,2D,2C,2H,3S,3D,3C,3H,4S,4D,4C,4H,5S,5D,5C,5H,6S,6D,6C,6H,7S,7D,7C,7H,JS,JD,JC,JH,QS,QD,QC,QH,KS,KD,KC,KH";
  //const deckCards = "AS,AD,3D,KH,2D,2C,3H,3S,5D,7H";

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
    totalPoints,
    setTotalPoints,
    opponentTotalPoints,
    setOpponentTotalPoints,
    isLastToTake,
    setIsLastToTake,
    canDraw,
    setCanDraw,
    canDeal,
    setCanDeal,
    canPlay,
    setCanPlay,
    toastMessage,
    setToastMessage,
    gameType,
    setGameType,
    matta,
    setMatta
  } = useBaseState();

  const {
    socket,
    setSocket,
    room,
    setRoom,
    rooms,
    setRooms,
    name,
    setName,
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
    const getDeckOffline = async () => {
      await getDeck();
      setCardsDealt(true)
      setIsMyTurn(false)
    }

    if (mode === "single" && !deck && gameType) {
      if (isMyTurn)
        getDeckOffline()
    }
  }, [mode, deck, gameType])

  useEffect(() => {
    const botDeal = async () => { await getDeck(true); setCardsDealt(true); setIsMyTurn(true) }
    const botDraw = async () => { if (await botDrawCards()) setIsMyTurn(true) }
    const botMove = async () => { await botMakeMove(); setIsMyTurn(true) }

    if (!isMyTurn && mode === "single") {
      if (botHand.length <= 0) {
        if (cardsDealt) {
          setTimeout(() => {
            botDraw()
          }, getRandomIntInclusive(700, 1500))
        }
        else {
          if (!deck)
            botDeal()
        }
      }
      else {
        setTimeout(() => {
          botMove()
        }, getRandomIntInclusive(1000, 2000))
      }  
    }
  }, [isMyTurn, deck, gameType])
  /* END BOT LOGIC */
    

  useEffect(() => {
    if (mode === "multi") {
      const newSocket = io(server,
        {
          reconnectionDelay: 10000, // defaults to 1000
          reconnectionDelayMax: 10000 // defaults to 5000
        }
      );

      setSocket(newSocket);
      
      newSocket.emit("getRooms")
      
      newSocket.on("connect", () => {
        if (socket?.recovered) {
          console.debug("Giocatore riconnesso")
          newSocket.emit('playerReconnected', name, room)
        } else {
          console.debug("Giocatore connesso")
        }
      });

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
  
      newSocket.on('playersUpdate', ({ players, gameType, currentTurn }) => {
        //console.debug(players)

        setPlayers(players);
        setGameType(gameType);
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

      newSocket.on('toast', (toast) => {
        setToastMessage(toast)
      });

      newSocket.on('aMonte', (toast) => {
        setToastMessage(toast)

        setTimeout(() => {
          setTable([])
          setHand([])
          setDeck("")
          setOpponentPlayedCards([])
          setCardsDealt(false)
          setScope(0)
          setOpponentScope(0)
        }, 2500);
      });

      newSocket.on('mattata', (toast) => {
        setToastMessage(toast)

        setOpponentTotalPoints(prevPoints => prevPoints+51)

        setTimeout(() => {
          setGameIsOver(true)
        }, 2500);
      });

      newSocket.on('matta', (matta) => {
        setMatta(matta)
      });

      newSocket.on('is15or30', (remaining, toast) => {
        setRemaining(remaining)

        setToastMessage(toast)
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
        checkForCapottu(piccola, grande, true, false)

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

      newSocket.on('nextHand', () => {
        setGameIsOver(false)

        setDeck("")
        
        setCardsDealt(false)
        
        setScope(0)
        setOpponentScope(0)
        
        setFinalScore({})
        setOpponentFinalScore({})
        
        setOpponentPlayedCards([])
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
      socket.emit('joinRoom', room, name, gameType);
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
    if (playerID)
      setIsMyTurn(playerID === currentTurn.replaceAll("-", ""));
  }, [playerID, currentTurn]);

  useEffect(() => {
    if (socket)
      socket.emit("scopeUpdate", scope, room)
  }, [scope]);

  useEffect(() => {
    if (mode === "multi")
      endTurn()
  }, [cardsDealt]);

  useEffect(() => {
    if (mode === "multi")
      socket.emit("matta", matta, room)
  }, [matta]);

  useEffect(() => {
    if (remaining <= 0 && hand.length === 0 && opponentsHand === 0 && !gameIsOver) {
        if (mode === "single") {
          if (botHand.length === 0) {
            setTimeout(() => {
              setGameIsOver(true)
            }, 2000)
          }
        }
        else {
          setTimeout(() => {
            setGameIsOver(true)
          }, 2000)
        }
    }
  }, [remaining, hand, opponentsHand, botHand]);

  useEffect(() => {
    if (gameIsOver) {
      computeScore()
      if (mode === "single") computeScore(true)
    }
    else {
      setDeck("")

      setCardsDealt(false)

      setScope(0)
      setOpponentScope(0)

      setFinalScore({})
      setOpponentFinalScore({})

      setOpponentPlayedCards([])

      if (socket)
        socket.emit("nextHand", room)
    }
  }, [gameIsOver]);

  useEffect(() => {
    if (toastMessage[0]) {
      if (!toastMessage[1])
        toast(toastMessage[0]);
      if (toastMessage[1] === "success")
        toast.success(toastMessage[0]);
      if (toastMessage[1] === "error")
        toast.error(toastMessage[0]);

      setToastMessage(["", ""])
    }
  }, [toastMessage]);

  useEffect(() => {
    const coinFlip = getRandomIntInclusive(0, 1)

    setIsMyTurn(!!coinFlip)
  }, [])

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

  const getDeck = async (isBot=false) => {
    let playerCount = 0
    if (mode === "multi")
      playerCount = await fetchPlayersInRoom()

    if (playerCount === 2 || mode === "single") {
      return await fetch("https://www.deckofcardsapi.com/api/deck/new/shuffle/?cards="+deckCards)
      .then((res) => res.json())
      .then(async (data) => {
        if (data.deck_id) {
          setDeck(data.deck_id)
          
          await dealCards(4, data.deck_id, isBot)

          if (mode === "multi") socket.emit('deckID', data.deck_id, room);

          setCardsDealt(true)
        }
      })
    }
  }

  const dealCards = async (count=4, deckID, isBot=false) => {

    setCanDeal(false)

    return await fetch("https://www.deckofcardsapi.com/api/deck/"+deckID+"/draw/?count="+count)
    .then((res) => res.json())
    .then(async (data) => {
      if (data.cards) {

        setTable((prevTable) => [...prevTable, ...data.cards]);
        setRemaining(data.remaining)

        let aces = 0
        for (const card of data.cards) {
          if (card.code[0] === "A")
            aces++
        }

        const allEqual = data.cards.every(card => card.code[0] === data.cards[0].code[0]);

        if (allEqual) {
          const toastMattata = "Mattata! Alle cards dealt are equal, game ends!"

          if (mode === "multi") socket.emit('mattata', [toastMattata, "error"], room)

          if (isBot) {
            setToastMessage([toastMattata, "error"])
            setOpponentTotalPoints(prevPoints => prevPoints+51)
          }
          else {
            setToastMessage([toastMattata, "success"])
            setTotalPoints(prevPoints => prevPoints+51)
          }

          setTimeout(() => {
            setGameIsOver(true)
          }, 3500);

          return
        }

        if (aces >= 2) {
          const toastMonte = "A monte! 2 aces dealt"

          setCanDraw(false)

          if (mode === "multi") socket.emit('aMonte', [toastMonte, "error"], room)

          setToastMessage([toastMonte, "error"])

          setTimeout(() => {
            setBotHand([])
            setTable([])
            setHand([])
            setDeck("")
            setOpponentPlayedCards([])
            setCardsDealt(false)
            setScope(0)
            setOpponentScope(0)
            setCanDraw(true)

            //DA VERIFICARE
            setIsMyTurn(prev =>  !prev)
          }, 2500);

          return
        }

        let cardsSum = getCardsSum(data.cards)

        /* ********* */
        // 7 DI CUORI
        /* ********* */
        const mattaValue = checkMatta(data.cards, cardsSum, isBot)
        /* ********* */
        // 7 DI CUORI
        /* ********* */
        
        cardsSum = getCardsSum(data.cards, mattaValue)

        // WORKAROUND -> NON BELLO
        if (cardsSum == 15 || cardsSum == 30) {
          if (cardsSum == 15) {
            if (isBot)
              setOpponentScope(prev => prev)
            else
              setScope(prev => prev)
          }
          else if (cardsSum == 30) {
            if (isBot)
              setOpponentScope(prev => prev+1)
            else
              setScope(prev => prev+1)
          }

          const tableCards = data.cards.map(card => card.code);
          const tableCardsTaken = tableCards.join(",")
          
          const toast15or30 = "15 or 30 in table! Table cards taken"
          if (mode === "multi") socket.emit('is15or30', data.remaining, [toast15or30, "error"], room)
          
          if (isBot)  
            setToastMessage([toast15or30, "error"])
          else
            setToastMessage([toast15or30, "success"])

          setTimeout(async () => {
            if (isBot)
              await botAddToPile(tableCardsTaken, tableCards, deckID)
            else
              await addToPile(tableCardsTaken, tableCards, deckID)
          }, 2000)
        }
        else
          if (mode === "multi") socket.emit('dealCards', data.cards, data.remaining, room);
      }

      setCanDeal(true)
    })
  }

  const drawCards = async (count=3) => {
    if (remaining-count >= 0) {

      setCanDraw(false)

      return await fetch("https://www.deckofcardsapi.com/api/deck/"+deck+"/draw/?count="+count)
      .then((res) => res.json())
      .then((data) => {
        if (data.cards) {

          setHand((prevHand) => [...prevHand, ...data.cards]);
          setRemaining(data.remaining)

          const cardsSum = getCardsSum(data.cards)

          /* ********* */
          // 7 DI CUORI
          /* ********* */
          const mattaValue = checkMatta(data.cards, cardsSum)
          /* ********* */
          // 7 DI CUORI
          /* ********* */

          // se è il giocatore 1 resetto sempre
          if (resetOpponentHand || (mode === "multi" && players[1].id.replaceAll("-", "") == playerID))
            setOpponentPlayedCards([])

          setResetOpponentHand(true)
          
          let isTris = false

          if (checkTris(data.cards, mattaValue)) {
            isTris = true

            const toastTris = "*TOC TOC* Tris!"
            setToastMessage([toastTris, "success"])

            setScope(prev => prev+10)
            
            if (mode === "multi") {
              socket.emit('trisOrLess10', data.cards, room)
              socket.emit('toast', [toastTris, "error"], room)
            }
          }
  
          if (checkLess10(data.cards, mattaValue)) {
            const toastLess10 = "*TOC TOC* < 10!"
            const toastBoth = "*TOC TOC* Tris AND < 10!"

            isTris ? setToastMessage([toastBoth, "success"]) : setToastMessage([toastLess10, "success"])

            setScope(prev => prev+3)

            if (mode === "multi") {
              socket.emit('trisOrLess10', data.cards, room)
              
              isTris ? socket.emit('toast', [toastBoth, "error"], room) : socket.emit('toast', [toastLess10, "error"], room)
            }
          }
  
          if (mode === "multi") socket.emit('playerDraw', count, data.remaining, room);

          setCanDraw(true)

          return true
        }
      })
    }
    return false
  }

  const addToPile = async (cardsTaken, selectedTableCards, deck_id=deck) => {
    let pile_name = playerID ? playerID : "player_"+deck_id

    return await fetch("https://www.deckofcardsapi.com/api/deck/"+deck_id+"/pile/"+pile_name+"_pile/add/?cards="+cardsTaken)
    .then((res) => res.json())
    .then(async (data) => {
      if (data.piles[pile_name+"_pile"]) {

        if (cardsTaken.split(",").includes("7H"))
          setMatta("")

        const newTable = table.filter(x => !selectedTableCards.includes(x.code))
        const newHand = hand.filter(x => x.code != selectedCard)

        // ultime carte sul tavolo, non si può fare scopa
        if (newTable.length == 0 && ((newHand.length !== 0 && opponentsHand !== 0) || remaining !== 36))
          setScope(prev => prev+1)

        setHand(newHand)
        setTable(newTable)

        setSelectedCard("")
        setSelectedTableCard([])

        if (mode === "multi") socket.emit('playerMove', {code: selectedCard}, cardsTaken, newTable, room);

        setIsLastToTake(true)

        return true;
      }
    })
  }

  const addCardToTable = (dragEvent=false) => {
    const card = dragEvent ? JSON.parse(dragEvent.dataTransfer.getData('card')) : selectedCard;

    setHand(
      hand.filter(x => x.code != card)
    )

    const playedCard = hand.filter(x => x.code == card)

    const newTable = [...table, ...playedCard]

    setSelectedCard("")
    setTable(newTable);

    if (mode === "multi") socket.emit('playerMove', playedCard[0], "", newTable, room);

    // la mossa è sempre valida
    return true;
  }

  const playerMove = async () => {
    
    setCanPlay(false)

    let moveIsValid = false;

    // MATTA
    const cardValue = selectedCard === "7H" ? (matta ? matta : selectedCard) : selectedCard
    // MATTA

    // gestione asso
    if (cardValue[0] === "A") {
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

      // 7 DI CUORI
      for (let i=0; i<cardsTakenArray.length; i++) {
        if (cardsTakenArray[i] === "7H") {
          if (matta) {
            cardsTakenArray[i] = matta
            break
          }
        }
      }

      let playedCard = ""
      if (selectedCard === "7H") {
        if (matta) {
          playedCard = matta
          cardsTakenArray.shift()
        }
        else
          playedCard = cardsTakenArray.shift()
      }
      else 
        playedCard = cardsTakenArray.shift()
      // 7 DI CUORI

      if (cardsTakenArray.length === 1) {
        if (parseInt(getValueOfCard(playedCard)) === parseInt(getValueOfCard(cardsTakenArray[0])) || parseInt(getValueOfCard(playedCard)) + parseInt(getValueOfCard(cardsTakenArray[0])) === 15)
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
        if (response)
          resolve(response.count);
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

    return await fetch("https://www.deckofcardsapi.com/api/deck/"+deck+"/pile/"+pile_name+"_pile/list/")
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

        checkForCapottu(piccola, grande, false, isBot)

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

      if (!isBot) setToastMessage(["Game is over!", "success"])
    });
  }

  const goMainMenu = () => {
    setMode("")
    setName("")
    setRoom("")
    setSocket("")
    setGameType("")
    setIsMyTurn(false)
  }

  const MainMenuButton = () => {
    return(
      <>
        <br/>
        <button onClick={() => goMainMenu()}>Go back</button>
      </>
    );
  }

  const checkForCapottu = (piccola, grande, isOpponent, isBot) => {
    if (piccola === 6 && grande) {
      const toastCapottu = "Capottu! Player took all the diamonds!"
      const type = (isOpponent || isBot) ? "error" : "success"

      (isOpponent || isBot) ? setOpponentTotalPoints(prevPoints => prevPoints+51) : setTotalPoints(prevPoints => prevPoints+51)

      setToastMessage([toastCapottu, type])
    }
  }

  const checkMatta = (cards, cardsSum, isBot=false) => {
    const isMatta =  cards.some(card => card.code === "7H")

    const cardsCodes = cards.map(card => card.code).join(", ")

    if (isMatta) {
      const mattaOptions = getMattaOptions(cards, cardsSum)
      
      if (!isBot) {
        if (mattaOptions.length > 0) {
          let prompt = "You drew the Matta (7H)! Choose what value should it get:\nThis is your hand: "+ cardsCodes + "\nPossible options:\n"
          for (const option of mattaOptions)
            prompt += option.options + " - " + option.type + "\n"
  
          let windowPrompt = window.prompt(prompt)
  
          while (!mattaOptions.some(option => option.options === windowPrompt))
            windowPrompt = window.prompt(prompt)
  
          setMatta(windowPrompt)
  
          return windowPrompt
        }
      }
      else {
        // Bot ha pescato la matta
        setMatta(mattaOptions[mattaOptions.length-1].options)

        return mattaOptions[mattaOptions.length-1].options
      }
    }

    return ""
  }


  /* BOT FUNCTIONS */
  const botDrawCards = async (count=3) => {
    if (remaining-count >= 0) {

      return await fetch("https://www.deckofcardsapi.com/api/deck/"+deck+"/draw/?count="+count)
      .then((res) => res.json())
      .then((data) => {
        if (data.cards) {

          setBotHand((prevHand) => [...prevHand, ...data.cards]);
          setRemaining(data.remaining)

          const cardsSum = getCardsSum(data.cards)

          /* ********* */
          // 7 DI CUORI
          /* ********* */
          const mattaValue = checkMatta(data.cards, cardsSum, true)
          /* ********* */
          // 7 DI CUORI
          /* ********* */

          let isTris = false

          if (checkTris(data.cards, mattaValue)) {
            setResetOpponentHand(false)

            isTris = true

            setOpponentScope(prev => prev+10)
            setOpponentPlayedCards(data.cards)

            const toastTris = "*TOC TOC* Tris!"
            setToastMessage([toastTris, "error"])
          }
  
          if (checkLess10(data.cards, mattaValue)) {
            setResetOpponentHand(false)
            
            setOpponentScope(prev => prev+3)
            setOpponentPlayedCards(data.cards)

            const toastLess10 = "*TOC TOC* < 10!"
            const toastBoth = "*TOC TOC* Tris AND < 10!"
            
            isTris ? setToastMessage([toastBoth, "error"]) : setToastMessage([toastLess10, "error"])
          }

          return true
        }
      })
    }
    else
      return false
  }

  const botAddCard = async (botSelectedCard) => {
    setBotHand(
      botHand.filter(x => x.code != botSelectedCard)
    )

    const playedCard = botHand.filter(x => x.code == botSelectedCard)
    
    // la mossa è sempre valida
    setTable((prevTable) => [...prevTable, ...playedCard]);

    return true;
  }

  const botTakeCard = async (botPlayedCard, botSelectedTableCard) => {
    const cardsTaken = botPlayedCard+","+botSelectedTableCard.join(",")

    return await botAddToPile(cardsTaken, botSelectedTableCard)
  }

  const botAddToPile = async (cardsTaken, selectedTableCards, deck_id=deck) => {
    return await fetch("https://www.deckofcardsapi.com/api/deck/"+deck_id+"/pile/bot_"+deck_id+"_pile/add/?cards="+cardsTaken)
    .then((res) => res.json())
    .then(async (data) => {
      if (data.piles["bot_"+deck_id+"_pile"]) {

        const cardsTakenArray = cardsTaken.split(",")
        const botSelectedCard = cardsTakenArray.shift()

        const newTable = table.filter(x => !selectedTableCards.includes(x.code))
        const newBotHand = botHand.filter(x => x.code != botSelectedCard)

        if (cardsTaken.split(",").includes("7H"))
          setMatta("")

        // ultime carte sul tavolo, non si può fare scopa
        if (newTable.length == 0 && ((hand.length !== 0 && newBotHand !== 0) || remaining !== 36))
          setOpponentScope(prev => prev+1)

        setBotHand(newBotHand)
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
    //const sumOfTable = tableCards.reduce((acc, card) => { return acc + parseInt(getValueOfCard(card)) }, 0)
    const cardsSum = getCardsSum(table, matta)

    // posso fare scopa
    for (const card of botCards) {
      const curCard = card === "7H" ? (matta ? matta : card) : card 

      if (cardsSum < 15) {
        if (parseInt(getValueOfCard(curCard)) + cardsSum === 15 || parseInt(getValueOfCard(curCard)) === cardsSum)
          return [card, tableCards]
      }
    }

    //faccio scopa con l'asso
    for (const card of botCards) {
      if ((card[0] === 'A' || (card === "7H" && matta === 'A')) && !aceInTable)
        return [card, tableCards]
    }

    // posso fare 15 con più carte
    for (const card of botCards) {
      const curCard = card === "7H" ? (matta ? matta : card) : card

      const combinationFor15 = checkCombinationFor15(matta, tableCards, parseInt(getValueOfCard(curCard)))
      if (combinationFor15 && combinationFor15.length > 0)
        return [card, combinationFor15]
    }

    // trovo carta uguale o faccio 15 con una carta
    for (const card of botCards) {
      const curCard = card === "7H" ? (matta ? matta : card) : card 

      const validTableCard = tableCards.find(tableCard => {
        const curTableCard = tableCard === "7H" ? (matta ? matta : tableCard) : tableCard 

        if ( getValueOfCard(curTableCard) === getValueOfCard(curCard) || parseInt(getValueOfCard(curTableCard)) + parseInt(getValueOfCard(curCard)) === 15 )
          return curTableCard
      })

      if (validTableCard)
        return [card, [validTableCard]]
    }

    //caso base -> non posso prendere niente dal tavolo
    return [botCards[getRandomIntInclusive(0, botCards.length-1)], ""]
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
      <Toaster
        toastOptions={{
          // Define default options
          duration: 3750
        }}
      />

      {!deck &&
        <>
          <Landing />
          <span className='footer'>{version}</span>
        </>
      }

      {!mode &&
        <>
          <br/>
          <br/>

          <button onClick={() => setMode("single")}>Play offline</button>
          {" "}
          <button onClick={() => setMode("multi")}>Play online</button>

          <br/>
          <br/>
          <br/>

          <a href='https://www.ilmugugnogenovese.it/gioco-della-cirulla-regole/2/' target='_blank'>Click here to check the rules</a>
        </>
      }

      {(mode === "multi" && !room) &&
        <>
          {!name ? 
            <ChooseNameForm
              setName={setName}
            />
            :
            <>
              {(!room && !gameType) ?
                <ChooseGameTypeForm
                  setGameType={setGameType}
                />
                :
                <JoinRoomForm
                  setRoom={setRoom}
                  rooms={rooms}
                  gameType={gameType}
                />
              }
            </>
          }

          <MainMenuButton />
        </>
      }

      {(mode === "single" && !deck) &&
        <>
          <ChooseGameTypeForm
            setGameType={setGameType}
          />

          <MainMenuButton />
        </>
      }

      {(gameIsOver && Object.keys(finalScore).length > 0 && Object.keys(opponentFinalScore).length > 0) &&
        <DisplayScore
          finalScore={finalScore}
          opponentFinalScore={opponentFinalScore}
          totalPoints={totalPoints}
          setTotalPoints={setTotalPoints}
          opponentTotalPoints={opponentTotalPoints}
          setOpponentTotalPoints={setOpponentTotalPoints}
          gameType={gameType}
          setGameIsOver={setGameIsOver}
        />
      }

      {!gameIsOver &&
        <>
          {(playerID && room) &&
            <>
              {/*<p className='room'>Room: {room}</p>*/}

              { isMyTurn ? <h3 className='turn-message'>It's your turn!</h3> : <h3 className='wait-message dots'>Waiting for the opponent</h3> }

              { !deck && players.map((player, key) => {
                return (
                  <li key={key}>
                    {player.name} {player.id.replaceAll("-", "") === playerID ? '(you)' : ''}
                  </li>
                )
              })}

              {!deck && isMyTurn && !cardsDealt &&
                <>
                  <br/>
                  {players.length === 2 ?
                    <button disabled={!canDeal} onClick={async () => await getDeck() }>Deal cards</button>
                  :
                    <p>2 players needed to start the game</p>
                  }

                  <br/>

                  <MainMenuButton />
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

              <h4>
                Cards remaining: {remaining}
              </h4>

              <OpponentHand
                playedCards={opponentPlayedCards}
              />

              <p>
                Scope: {opponentScope}
              </p>

              <Table
                cards={table}
                selectedTableCard={selectedTableCard}
                setSelectedTableCard={setSelectedTableCard}
                addCardToTable={addCardToTable}
                endTurn={endTurn}
              />

              <p className='player-scope'>
                Scope: {scope}
                {matta &&
                  <>
                    {" - matta: "} {matta}
                  </>
                }
              </p>
            </>
          }

          {(deck && hand.length <= 0 && isMyTurn) &&
              <button className={"button-move"} disabled={!canDraw} onClick={async () => {
                if (await drawCards())
                  endTurn()
              }}>Draw cards</button>
          }

          {hand.length > 0 &&
            <>

              {/*<p>Player's hand</p>*/}

              <Hand
                cards={hand}
                selectedCard={selectedCard}
                setSelectedCard={setSelectedCard}
              />

              {(selectedCard && isMyTurn) &&
                <button className={"button-move"} disabled={!canPlay} onClick={async () => {
                  const moveIsValid = await playerMove()
                  if (moveIsValid)
                    endTurn()
                  else
                    setToastMessage(["Move isn't valid", "error"])

                  setCanPlay(true)

                }}>
                  {selectedTableCard.length <= 0 ? "Add to the table" : "Take cards"}
                </button>
              }
            </>
          }
        </>
      }
    </div>
  )
}

export default App;