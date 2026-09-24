import { useEffect, useState } from "react";

function GameHeader({
    round,
    maxRounds,
    roundEndsAt,
    gameState,
    currentWord,
    wordLength
}) {

    const [time, setTime] =
        useState(0);

    useEffect(() => {

        if (!roundEndsAt) {
            setTime(0);
            return;
        }

        const interval =
            setInterval(() => {

                const remaining =
                    Math.max(
                        0,
                        Math.ceil(
                            (
                                roundEndsAt -
                                Date.now()
                            ) / 1000
                        )
                    );

                setTime(remaining);

            }, 250);

        return () => {
            clearInterval(interval);
        };

    }, [roundEndsAt]);

    let wordDisplay = "";

    if (currentWord) {
        wordDisplay = currentWord;
    } else if (wordLength) {
        wordDisplay =
            "_ ".repeat(
                wordLength
            );
    }

    return (
        <div className="game-header">

            <div>
                Round {round} / {maxRounds}
            </div>

            <div>
                {gameState === "DRAWING"
                    ? `${time}s`
                    : ""}
            </div>

            <div>
                {wordDisplay}
            </div>

        </div>
    );
}

export default GameHeader;