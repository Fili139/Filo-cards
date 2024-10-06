
// DisplayScore.js
import React from 'react';

const DisplayScore = ({ finalScore, opponentFinalScore }) => {
    return (
        <>
            <div>
                Your final score:
                <br/>
                Cards: {finalScore.cards}
                <br/>
                Diamonds: {finalScore.diamonds}
                <br/>
                Scope: {finalScore.scope}
            </div>

            <br/>
            <br/>

            <div>
                Your opponent's score:
                <br/>
                Cards: {opponentFinalScore.cards}
                <br/>
                Diamonds: {opponentFinalScore.diamonds}
                <br/>
                Scope: {opponentFinalScore.scope}
            </div>

            <br/>

            <button onClick={() => window.location.reload(false)}> Play again </button>
        </>
    );
};

export default DisplayScore;