import { useEffect, useRef } from 'react'
import './HistoryModal.css'
import './MattaModal.css'

// Shown when the player draws the Matta (7H). It has no close button on purpose:
// the game is waiting for a value, so one of the options must be picked.
const MattaModal = ({ cards, options, onChoose }) => {
    const firstOption = useRef(null)

    useEffect(() => {
        firstOption.current?.focus()
    }, [])

    return (
        <div className="modal-overlay">
            <div
                className="modal-content"
                role="dialog"
                aria-modal="true"
                aria-labelledby="matta-title"
            >
                <h3 id="matta-title">You drew the Matta!</h3>
                <p>Your hand:</p>

                <div className="matta-cards">
                    {cards.map((card) => (
                        <img key={card.code} src={card.image} alt={card.code} />
                    ))}
                </div>

                <p>Choose the value the Matta takes:</p>

                <div className="matta-options">
                    {options.map((option, index) => (
                        <button
                            key={option.options + "-" + option.type}
                            ref={index === 0 ? firstOption : null}
                            type="button"
                            className="matta-option"
                            onClick={() => onChoose(option.options)}
                        >
                            <strong>{option.options}</strong>
                            <small>{option.type}</small>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default MattaModal