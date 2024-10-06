export const getValueOfCard = (card) => {
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

export const check15or30 = (cards) => {
  let sum = 0

  for (const card of cards)
    sum += parseInt(getValueOfCard(card.code))

  return sum
}

export const checkTris = (cards) => {
  return cards.every((card) => card.code[0] === cards[0].code[0])
}

export const checkLess10 = (cards) => {
  let sum = 0

  for (const card of cards)
    sum += parseInt(getValueOfCard(card.code))

  return sum <= 10
}

export const handleBeforeUnload = (e) => {
  e.preventDefault();
  
  const message =
    "Are you sure you want to leave? All provided data will be lost.";
  e.returnValue = message;
  return message;
};


export default { handleBeforeUnload, getValueOfCard, check15or30, checkTris, checkLess10 };