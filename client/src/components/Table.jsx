// Table.js
import React from 'react';
import Card from './Card';
import './Table.css';

const Table = ({ cards, selectedTableCard, setSelectedTableCard }) => {
    return (
        <div className="table-cards">
            {cards.map((card, index) => (
                <Card origin="table" key={index} code={card.code} image={card.image} suit={card.suit} value={card.value} selectedCard={selectedTableCard} setSelectedCard={setSelectedTableCard} isSelected={selectedTableCard.includes(card.code)}/>
            ))}
        </div>
    )
};

export default Table;