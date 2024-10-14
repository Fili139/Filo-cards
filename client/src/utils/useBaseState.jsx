import { useState } from "react";

export const useBaseState = () => {
    
  const [mode, setMode] = useState("");

  const [gameIsOver, setGameIsOver] = useState(false);

  const [isMyTurn, setIsMyTurn] = useState(false);
  
  const [cardsDealt, setCardsDealt] = useState(false);

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

  const [canDraw, setCanDraw] = useState(true)
  const [canPlay, setCanPlay] = useState(true)

  const [toastMessage, setToastMessage] = useState("")

  return {
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
    setCanPlay,
    toastMessage,
    setToastMessage
  };
};