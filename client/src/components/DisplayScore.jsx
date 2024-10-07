
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
                <br/>
                Piccola: {finalScore.piccola ? finalScore.piccola : "no"}
                <br/>
                Grande: {finalScore.grande ? finalScore.grande : "no"}
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
                <br/>
                Piccola: {opponentFinalScore.piccola ? opponentFinalScore.piccola : "no"}
                <br/>
                Grande: {opponentFinalScore.grande ? opponentFinalScore.grande : "no"}
            </div>

            <br/>

            <button onClick={() => window.location.reload(false)}> Play again </button>
        </>
    );
};

export default DisplayScore;