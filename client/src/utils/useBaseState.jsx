import { useState } from "react";

export const useBaseState = () => {
    
  const [mode, setMode] = useState("");

  const [gameIsOver, setGameIsOver] = useState(false);

  const [isMyTurn, setIsMyTurn] = useState(false);
  
  const [cardsDealt, setCardsDealt] = useState(false);

  const [deck, setDeck] = useState("");
  const [hand, setHand] = useState([]);
  const [table, setTable] = useState([]);
  const [remaining, setRemaining] = useState(40);
  
  const [opponentsHand, setOpponentsHand] = useState(0);
  const [opponentPlayedCards, setOpponentPlayedCards] = useState([]);
  const [resetOpponentHand, setResetOpponentHand] = useState(true);

  const [selectedCard, setSelectedCard] = useState("");
  const [selectedTableCard, setSelectedTableCard] = useState([]);
  
  const [scope, setScope] = useState(0);
  const [opponentScope, setOpponentScope] = useState(0);

  const [finalScore, setFinalScore] = useState({});
  const [opponentFinalScore, setOpponentFinalScore] = useState({});
  const [totalPoints, setTotalPoints] = useState(0);
  const [opponentTotalPoints, setOpponentTotalPoints] = useState(0);

  const [isLastToTake, setIsLastToTake] = useState(false);

  const [canDraw, setCanDraw] = useState(true)
  const [canDeal, setCanDeal] = useState(true)
  const [canPlay, setCanPlay] = useState(true)

  const [toastMessage, setToastMessage] = useState("")

  const [gameType, setGameType] = useState("")

  const [matta, setMatta] = useState("")

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
  };
};