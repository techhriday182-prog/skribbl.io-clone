function PlayerList({
    players,
    drawerId
}) {

    return (
        <div className="player-list">

            <h2>Players</h2>

            {players.map((player) => (

                <div
                    key={player.id}
                    className="player"
                >

                    <span>
                        {player.id ===
                            drawerId
                            ? "✏️ "
                            : ""}

                        {player.name}
                    </span>

                    <span>
                        {player.score}
                    </span>

                </div>

            ))}

        </div>
    );
}

export default PlayerList;