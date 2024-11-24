import React from 'react';
import './HistoryModal.css';

const HistoryModal = ({ history, closeModal }) => {

    const MovesList = () => {
        return (
            history.map((move, index) => (
                <li key={index}>
                    {move.player === "you"
                        ?
                        <>
                            You played: {move.playedCard}
                        </>
                        :
                        <>
                            Opponent played: {move.playedCard}
                        </>
                    }
                </li>
            ))
        );
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">

                <h3>Moves</h3>

                {history.length > 0
                    ?
                    <ul>
                        <MovesList />
                    </ul>
                    :
                    <p>History is empty</p>
                }

                <button onClick={closeModal}>Close</button>
            </div>
        </div>
    );
}

export default HistoryModal;