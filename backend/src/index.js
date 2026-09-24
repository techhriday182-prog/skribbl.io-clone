const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
dotenv.config();
console.log("MONGO_URI =", process.env.MONGO_URI);
const RoomManager = require("./rooms/roomManager.js");
const GameManager = require("./game/GameManger.js");
const registerSocketHandlers = require("./socket/socketHandlers");
 
const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL
}));
app.use(express.json());

// app.get("/", (req, res) => {
//     res.json({
//         message: "Skribbl clone backend is running"
//     });
// });

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"]
    }
});

const roomManager = new RoomManager();

const gameManager = new GameManager(io);

io.on(
    "connection",
    (socket) => {

        console.log(
            "Player connected:",
            socket.id
        );

        registerSocketHandlers(
            io,
            socket,
            roomManager,
            gameManager
        );
    }
);

const PORT =
    process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
