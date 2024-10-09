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

  return sum <= 9
}

export const handleBeforeUnload = (e) => {
  e.preventDefault();
  
  const message =
    "Are you sure you want to leave? All provided data will be lost.";
  e.returnValue = message;
  return message;
};

export const computePrimiera = (cards) => {
  const primieraValues = {
    '7': 21,
    '6': 18,
    'A': 16,
    '5': 15,
    '4': 14,
    '3': 13,
    '2': 12,
    'K': 10,
    'Q': 10,
    'J': 10
  };
  
  const bestCards = {};

  cards.forEach((card) => {
    const value = card.code[0]
    const suit = card.code[1]

    if (!bestCards[suit] || primieraValues[value] > primieraValues[bestCards[suit][0]])
      bestCards[suit] = card.code
  });

  // Sommiamo i valori delle migliori carte
  const primieraScore = Object.values(bestCards).reduce((acc, card) => {
      return acc + primieraValues[card[0]];
  }, 0);

  return primieraScore;
};

export const grandeCondition = ["QD", "JD", "KD"];

export const piccolaCondition = ["AD", "2D", "3D", "4D", "5D", "6D", "7D"];

export const getRandomIntInclusive = (min, max) => {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);

  const randomNumber = Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);

  return randomNumber// The maximum is inclusive and the minimum is inclusive
}


export default { handleBeforeUnload, getValueOfCard, check15or30, checkTris, checkLess10, computePrimiera, getRandomIntInclusive, grandeCondition, piccolaCondition };