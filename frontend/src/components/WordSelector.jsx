import socket from "../socket";

function WordSelector({ words }) {

    const selectWord = (word) => {

        socket.emit(
            "select-word",
            {
                word
            }
        );
    };

    return (
        <div className="word-selector">

            <h2>
                Choose a word
            </h2>

            {words.map((word) => (

                <button
                    key={word}
                    onClick={() =>
                        selectWord(word)
                    }
                >
                    {word}
                </button>

            ))}

        </div>
    );
}

export default WordSelector;