// Table.js
import React from 'react';
import Card from './Card';
import './Table.css';

const Table = ({ cards, selectedTableCard, setSelectedTableCard, addCardToTable, endTurn, setOpenModal }) => {
    return (
        <div className={cards.length > 0 ? 'table' : 'table-empty'}>
            <h4>Table</h4>
            <div
                onDrop={(e) => {
                    e.preventDefault();
                    addCardToTable(e)
                    endTurn()
                }}
                onDragOver={(e) => e.preventDefault()}
            >
                {cards.length > 0
                    ?
                    cards.map((card, index) => (
                        <Card origin="table" key={index} code={card.code} image={card.image} suit={card.suit} value={card.value} selectedCard={selectedTableCard} setSelectedCard={setSelectedTableCard} isSelected={selectedTableCard.includes(card.code)}/>
                    ))
                    :
                    <b>Table is empty :(</b>
                }
            </div>
        </div>
    )
};

export default Table;