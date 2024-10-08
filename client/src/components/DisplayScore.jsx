
// DisplayScore.js
import React from 'react';

const DisplayScore = ({ finalScore, opponentFinalScore }) => {

    let totalScore = 0
    let opponentTotalScore = 0

    const computeTotal = () => {
        for (const [key, value] of Object.entries(finalScore)) {
            switch (key) {
                case 'cards':
                case 'diamonds':
                case 'primiera':
                    if (finalScore[key] > opponentFinalScore[key])
                        totalScore++
                    else if (opponentFinalScore[key] > finalScore[key])
                        opponentTotalScore++

                    console.debug(key, totalScore, opponentTotalScore)

                    break
                case 'settebello':
                    if (finalScore[key])
                        totalScore++
                    else
                        opponentTotalScore++

                    console.debug(key, totalScore, opponentTotalScore)

                    break
                case 'piccola':
                    if (finalScore[key])
                        totalScore += finalScore[key]+1
                    else if (opponentFinalScore[key])
                        opponentTotalScore += opponentFinalScore[key]+1

                    console.debug(key, totalScore, opponentTotalScore)

                    break
                case 'grande':
                    if (finalScore[key])
                        totalScore += 5
                    else if (opponentFinalScore[key])
                        opponentTotalScore += 5

                    console.debug(key, totalScore, opponentTotalScore)

                    break
                case 'scope':
                    totalScore += finalScore[key]
                    opponentTotalScore += opponentFinalScore[key]

                    console.debug(key, totalScore, opponentTotalScore)

                    break
            }
        }
    }

    computeTotal()

    return (
        <>
            <br/>
            <div>
                Your final score:
                <br/>
                <br/>
                Cards: {finalScore.cards}
                <br/>
                Diamonds: {finalScore.diamonds}
                <br/>
                Scope: {finalScore.scope}
                <br/>
                Sette bello: {finalScore.settebello ? "si" : "no"}
                <br/>
                Piccola: {finalScore.piccola ? finalScore.piccola+1 : "no"}
                <br/>
                Grande: {finalScore.grande ? "si" : "no"}
                <br/>
                Primiera: {finalScore.primiera}
                <br/>
                <br/>
                Total: {totalScore}
            </div>

            <br/>
            <br/>
            <br/>

            <div>
                Your opponent's score:
                <br/>
                <br/>
                Cards: {opponentFinalScore.cards}
                <br/>
                Diamonds: {opponentFinalScore.diamonds}
                <br/>
                Scope: {opponentFinalScore.scope}
                <br/>
                Sette bello: {opponentFinalScore.settebello ? "si" : "no"}
                <br/>
                Piccola: {opponentFinalScore.piccola ? opponentFinalScore.piccola+1 : "no"}
                <br/>
                Grande: {opponentFinalScore.grande ? "si" : "no"}
                <br/>
                Primiera: {opponentFinalScore.primiera}
                <br/>
                <br/>
                Total: {opponentTotalScore}
            </div>

            <br/>
            <br/>
            <br/>

            <button onClick={() => window.location.reload(false)}> Play again </button>
        </>
    );
};

export default DisplayScore;