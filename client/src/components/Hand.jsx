// Hand.js
import React from 'react';
import Card from './Card';
import './Hand.css';

const Hand = ({ cards, selectedCard, setSelectedCard }) => {
  /*
  const [tempCards, setTempCards] = useState([])
  const [diff, setDiff] = useState({})

  useEffect(() => {
    const diff = tempCards.filter((card1) => !cards.some(card2 => card1.code === card2.code))

    setTempCards(cards)
    setDiff(diff)
  }, [cards])
  */

  return (
    <div className="player-hand">
      {cards.map((card, index) => (
        <Card origin="hand" key={index} code={card.code} image={card.image} suit={card.suit} value={card.value} selectedCard={selectedCard} setSelectedCard={setSelectedCard} isSelected={selectedCard === card.code} />
      ))}
    </div>
  );
};

export default Hand;