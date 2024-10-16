
// DisplayScore.js
import React, { useEffect, useState, useRef } from 'react';

const DisplayScore = ({ finalScore, opponentFinalScore, totalPoints, setTotalPoints, opponentTotalPoints, setOpponentTotalPoints, gameType, setGameIsOver }) => {
    const [prevPoints, setPrevPoints] = useState(0)
    const [opponentPrevPoints, setOpponentPrevPoints] = useState(0)

    const totalScore = useRef(0);
    const opponentTotalScore = useRef(0);

    useEffect(() => {
        setPrevPoints(totalPoints)
        setOpponentPrevPoints(opponentTotalPoints)

        computeTotal()
    }, [])

    const computeTotal = () => {
        for (const [key, value] of Object.entries(finalScore)) {
            switch (key) {
                case 'cards':
                case 'diamonds':
                case 'primiera':
                    if (finalScore[key] > opponentFinalScore[key])
                        totalScore.current++
                    else if (opponentFinalScore[key] > finalScore[key])
                        opponentTotalScore.current++

                    console.debug(key, totalScore.current, opponentTotalScore.current)

                    break
                case 'settebello':
                    if (finalScore[key])
                        totalScore.current++
                    else
                        opponentTotalScore.current++

                    console.debug(key, totalScore.current, opponentTotalScore.current)

                    break
                case 'piccola':
                    if (finalScore[key])
                        totalScore.current += finalScore[key]+1
                    else if (opponentFinalScore[key])
                        opponentTotalScore.current += opponentFinalScore[key]+1

                    console.debug(key, totalScore.current, opponentTotalScore.current)

                    break
                case 'grande':
                    if (finalScore[key])
                        totalScore.current += 5
                    else if (opponentFinalScore[key])
                        opponentTotalScore.current += 5

                    console.debug(key, totalScore.current, opponentTotalScore.current)

                    break
                case 'scope':
                    totalScore.current += finalScore[key]
                    opponentTotalScore.current += opponentFinalScore[key]

                    console.debug(key, totalScore.current, opponentTotalScore.current)

                    break
            }
        }

        setTotalPoints(prevPoints => prevPoints+totalScore.current)
        setOpponentTotalPoints(prevPoints => prevPoints+opponentTotalScore.current)
    }

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
                Game points: {totalScore.current}
                <br/>
                {gameType === "full" && 
                    <>
                        Total points: {prevPoints} + {totalScore.current} {"->"} {totalPoints}
                    </>
                }
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
                Game points: {opponentTotalScore.current}
                <br/>
                {gameType === "full" && 
                    <>
                        Total points: {opponentPrevPoints} + {opponentTotalScore.current} {"->"} {opponentTotalPoints}
                    </>
                }
            </div>

            <br/>
            <br/>
            <br/>

            {(gameType === "fast" || (totalPoints >= 51 || opponentTotalPoints >= 51)) ? 
                <button onClick={() => window.location.reload(false)}> Play again </button>
                :
                <button onClick={() => setGameIsOver(false) }> Next hand </button>
            }
        </>
    );
};

export default DisplayScore;