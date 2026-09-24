import {
    useEffect,
    useState
} from "react";

import socket from "../socket";

function Chat() {

    const [messages, setMessages] =
        useState([]);

    const [message, setMessage] =
        useState("");

    useEffect(() => {

        const handleMessage = (
            data
        ) => {

            setMessages(
                (previous) => [
                    ...previous,
                    data
                ]
            );
        };

        const handleCorrectGuess = (
            data
        ) => {

            setMessages(
                (previous) => [
                    ...previous,
                    {
                        username: "Game",
                        message:
                            `🎉 ${data.playerName} guessed correctly!`
                    }
                ]
            );
        };

        socket.on(
            "chat-message",
            handleMessage
        );

        socket.on(
            "correct-guess",
            handleCorrectGuess
        );

        return () => {

            socket.off(
                "chat-message",
                handleMessage
            );

            socket.off(
                "correct-guess",
                handleCorrectGuess
            );

        };

    }, []);

    const sendMessage = (
        event
    ) => {

        event.preventDefault();

        if (!message.trim()) {
            return;
        }

        socket.emit(
            "guess",
            {
                guess: message
            }
        );

        setMessage("");
    };

    return (
        <div className="chat">

            <h2>Chat</h2>

            <div className="messages">

                {messages.map(
                    (msg, index) => (

                        <div
                            key={index}
                        >
                            <strong>
                                {msg.username}:
                            </strong>{" "}
                            {msg.message}
                        </div>

                    )
                )}

            </div>

            <form
                onSubmit={
                    sendMessage
                }
            >

                <input
                    value={message}
                    onChange={(e) =>
                        setMessage(
                            e.target.value
                        )
                    }
                    placeholder="Guess..."
                />

                <button>
                    Send
                </button>

            </form>

        </div>
    );
}

export default Chat;