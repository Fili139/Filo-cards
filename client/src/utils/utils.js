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

export const getCardsSum = (cards, mattaValue="") => {
  let sum = 0

  for (const card of cards) {
    if (card.code === "7H") {
      if (mattaValue) {
        sum += parseInt(getValueOfCard(mattaValue))
        continue
      }
    }
    
    sum += parseInt(getValueOfCard(card.code))
  }

  return sum
}

export const checkTris = (cards, mattaValue="") => {
  return cards.every((card) => card.code[0] === cards[0].code[0] || (card.code === "7H" && mattaValue === cards[0].code[0]))
}

export const checkLess10 = (cards, mattaValue="") => {
  let sum = 0

  for (const card of cards) {
    if (card.code === "7H") {
      if (mattaValue) {
        sum += parseInt(getValueOfCard(mattaValue))
        continue
      }
    }

    sum += parseInt(getValueOfCard(card.code))
  }

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

  return randomNumber // The maximum is inclusive and the minimum is inclusive
}

export const getMattaOptions = (cards, totalSum) => {
  const sumWithout7 = totalSum - 7
  const cardsWithout7 = cards.filter(card => card.code !== "7H")

  const allEqual = cardsWithout7.every(card => card.code[0] === cardsWithout7[0].code[0]);

  const options = [{
    options: "7",
    type: "default value"
  }]

  //console.debug(cards, totalSum, sumWithout7, cardsWithout7, allEqual)

  if (cards.length === 3) {
    if (sumWithout7+1 <= 9) {
      for (let i=0; i<9-sumWithout7; i++) {
        options.push({
          options: (9-sumWithout7-i).toString() === "1" ? "A" : (9-sumWithout7-i).toString(),
          type: "< 10"
        })
      }
    }

    if (allEqual) {
      options.push({
        options: cardsWithout7[0].code[0] === "1" ? "A" : cardsWithout7[0].code[0],
        type: "tris"
      })
    }
  }
  else if (cards.length === 4) {
    if (sumWithout7+1 <= 15) {
      if (15-sumWithout7 <= 10) {
        options.push({
          options: (15-sumWithout7).toString() === "1" ? "A" : (15-sumWithout7).toString(),
          type: "15 in table"
        })
      }
    }

    if (sumWithout7+1 <= 30) {
      if (30-sumWithout7 <= 10) {
        options.push({
          options: (30-sumWithout7).toString() === "1" ? "A" : (30-sumWithout7).toString(),
          type: "30 in table"
        })
      }
    }

    if (allEqual) {
      options.push({
        options: cardsWithout7[0].code[0] === "1" ? "A" : cardsWithout7[0].code[0],
        type: "MATTATA"
      })
    }
  }

  return options
}

export const checkCombinationFor15 = (matta, cards, x, index=0, currentSum=0, currentCombination=[], bestCombination=null) => {
  // Base case: se abbiamo controllato tutti gli elementi dell'array
  if (index === cards.length) {
    // Controlliamo se la somma corrente più x è uguale a 15 e se abbiamo almeno 2 elementi nell'array
    if (currentSum + x === 15 && currentCombination.length >= 2) {
      // Se non abbiamo ancora una bestCombination, o se la combinazione corrente è più lunga
      if (bestCombination === null || currentCombination.length > bestCombination.length)
        return currentCombination;  // Restituiamo questa combinazione come la migliore finora
    }
    return bestCombination;  // Nessuna nuova combinazione trovata, restituiamo la migliore finora
  }

  // 7 di cuori
  const curCard = cards[index] === "7H" ? (matta ? matta : cards[index]) : cards[index]

  // Caso ricorsivo: proviamo entrambe le possibilità
  // 1. Escludere l'elemento corrente
  let exclude = checkCombinationFor15(matta, cards, x, index + 1, currentSum, currentCombination, bestCombination);

  // 2. Includere l'elemento corrente nella somma
  let include = checkCombinationFor15(matta, cards, x, index + 1, currentSum + parseInt(getValueOfCard(curCard)), [...currentCombination, cards[index]], bestCombination);

  // Confrontiamo i risultati delle due scelte e restituiamo la combinazione migliore (quella con più elementi)
  return include && (!exclude || include.length > exclude.length) ? include : exclude;
}


export default { handleBeforeUnload, getValueOfCard, getCardsSum, checkTris, checkLess10, computePrimiera, getRandomIntInclusive, getMattaOptions, checkCombinationFor15, grandeCondition, piccolaCondition };