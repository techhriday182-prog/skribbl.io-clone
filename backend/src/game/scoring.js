function calculateGuesserScore(
    timeRemaining,
    totalTime
) {
    const ratio = timeRemaining /totalTime;

    return Math.max (
        50, Math.round(500*ratio)
    );
}

function calculateDrawerScore(numberOfCorrectGuessers) {
    return numberOfCorrectGuessers * 50;
}

module.exports = {
    calculateGuesserScore,
    calculateDrawerScore
};

