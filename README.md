# 🎨 Skribbl Clone

A real-time multiplayer drawing and guessing game inspired by **skribbl.io**, built as a full-stack web application using React, Node.js, Express, Socket.IO, and HTML5 Canvas.

## 🚀 Live Demo

**Live URL:** `https://YOUR-FRONTEND-URL.onrender.com`

> Replace the URL above with the actual deployed frontend URL after deployment.

---

## ✨ Features

### Lobby & Rooms

- Create a private game room
- Join a room using a room code
- Host controls the room settings
- Multiplayer player list
- Host can start the game
- Configurable:
  - Maximum players
  - Number of rounds
  - Drawing time

### 🎮 Gameplay

- Turn-based drawing system
- One player draws while the others guess
- Drawer receives multiple word choices
- Real-time game state synchronization
- Round and turn management
- Countdown timer
- Automatic turn progression
- Game-end leaderboard
- Winner determination

### 🎨 Drawing

- HTML5 Canvas
- Real-time drawing synchronization using Socket.IO
- Brush
- Brush size
- Colors
- Eraser
- Undo
- Clear canvas

### 💬 Guessing & Chat

- Players can submit guesses
- Correct guesses award points
- Incorrect guesses are displayed as chat messages
- Real-time chat between players

---

# 🛠️ Tech Stack

## Frontend

- React
- Vite
- JavaScript
- HTML5 Canvas
- Socket.IO Client

## Backend

- Node.js
- Express
- Socket.IO
- JavaScript

## Deployment

- Render

The current version does not require a database. Active rooms, players, game state, scores, and drawing strokes are maintained in server memory.

---

# 🏗️ Architecture

```text
                         Internet
                            │
             ┌──────────────┴──────────────┐
             │                             │
             ▼                             ▼
      React Frontend                 Node.js Backend
       Render Static Site             Render Web Service
             │                             │
             │       Socket.IO             │
             └─────────────────────────────┘
                                           │
                                           ▼
                                  ┌─────────────────┐
                                  │   GameManager   │
                                  └────────┬────────┘
                                           │
                                  ┌────────▼────────┐
                                  │      Game       │
                                  │                 │
                                  │ Turns           │
                                  │ Rounds          │
                                  │ Scoring         │
                                  │ Word selection  │
                                  │ Timer           │
                                  └────────┬────────┘
                                           │
                                  ┌────────▼────────┐
                                  │   RoomManager   │
                                  │                 │
                                  │ Rooms           │
                                  │ Players         │
                                  │ Settings        │
                                  └─────────────────┘
```

---

# 📁 Project Structure

```text
skribbl-clone/
│
├── backend/
│   ├── src/
│   │   ├── game/
│   │   │   ├── Game.js
│   │   │   ├── GameManager.js
│   │   │   ├── scoring.js
│   │   │   └── words.js
│   │   │
│   │   ├── rooms/
│   │   │   └── RoomManager.js
│   │   │
│   │   ├── socket/
│   │   │   └── socketHandlers.js
│   │   │
│   │   └── index.js
│   │
│   ├── package.json
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Lobby.jsx
│   │   │   ├── Game.jsx
│   │   │   ├── DrawingCanvas.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── PlayerList.jsx
│   │   │   ├── WordSelector.jsx
│   │   │   ├── GameHeader.jsx
│   │   │   └── RoomSettings.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── socket.js
│   │   └── index.css
│   │
│   ├── package.json
│   └── .gitignore
│
└── README.md
```

---

# 🔄 How the Application Works

## 1. Creating a Room

The host enters a username and creates a room.

The frontend emits:

```js
socket.emit("create-room", {
    username
});
```

The backend:

1. Generates a unique room ID.
2. Creates a room using `RoomManager`.
3. Adds the host as the first player.
4. Makes the Socket.IO connection join the room.
5. Creates a corresponding `Game` object.
6. Sends the room state back to the clients.

---

## 2. Joining a Room

A second player enters the room code.

The frontend emits:

```js
socket.emit("join-room", {
    roomId,
    username
});
```

The backend finds the room, checks its state and capacity, adds the player, and broadcasts the updated room state.

---

# 🎮 Game Flow

```text
Create Room
     │
     ▼
Lobby
     │
     │ Host starts game
     ▼
Choosing Word
     │
     │ Drawer selects word
     ▼
Drawing
     │
     ├───────────────┐
     │               │
     ▼               ▼
Players Draw     Players Guess
     │               │
     └───────┬───────┘
             ▼
        Round Ends
             │
             ▼
       Next Player
             │
             ▼
       Next Round
             │
             ▼
       All Rounds Done
             │
             ▼
        Game End
             │
             ▼
        Leaderboard
```

---

# 🔌 Socket.IO Architecture

Socket.IO is used for real-time communication between the frontend and backend.

The browser establishes a Socket.IO connection with the Node.js server.

Important events include:

| Event | Direction | Purpose |
|---|---|---|
| `create-room` | Client → Server | Create a room |
| `join-room` | Client → Server | Join a room |
| `start-game` | Client → Server | Host starts game |
| `word-options` | Server → Drawer | Send word choices |
| `select-word` | Client → Server | Drawer selects word |
| `drawing-started` | Server → Clients | Notify drawing start |
| `draw` | Client ↔ Server | Synchronize drawing strokes |
| `undo` | Client ↔ Server | Undo a stroke |
| `clear-canvas` | Client ↔ Server | Clear drawing |
| `guess` | Client → Server | Submit a guess |
| `correct-guess` | Server → Clients | Notify correct guess |
| `chat-message` | Client ↔ Server | Send chat message |
| `round-ended` | Server → Clients | End current round |
| `game-ended` | Server → Clients | End entire game |
| `room-state` | Server → Clients | Synchronize room state |

---

# 🎨 Drawing Synchronization

The drawing system uses HTML5 Canvas.

When the drawer moves the mouse over the canvas, the frontend creates a stroke containing information such as:

```js
{
    x1,
    y1,
    x2,
    y2,
    color,
    lineWidth
}
```

The stroke is sent to the backend through Socket.IO.

The server validates that the sender is currently the drawer and then broadcasts the stroke to the other players.

The receiving clients draw the same stroke on their canvas.

```text
Drawer Browser
      │
      │ draw event
      ▼
 Socket.IO Server
      │
      │ broadcast stroke
      ▼
Other Players
      │
      ▼
HTML5 Canvas
```

This allows all players to see the drawing in real time.

---

# 🧠 Game State Management

The backend keeps active rooms inside `RoomManager`.

```js
this.rooms = new Map();
```

Each room contains information such as:

```text
Room
├── id
├── hostId
├── players
├── state
├── settings
├── currentDrawerId
├── currentWord
├── round
├── currentPlayerIndex
├── roundEndsAt
├── wordOptions
├── guessedPlayers
└── strokes
```

`GameManager` maintains the `Game` instance associated with each room.

```js
this.games = new Map();
```

The `Game` class handles:

- Starting the game
- Selecting the drawer
- Selecting words
- Drawing
- Guessing
- Scoring
- Timers
- Round progression
- Game completion

---

# 🏆 Scoring

Correct guessers receive points based on the remaining drawing time.

The score calculation is based on the ratio between remaining time and total drawing time.

A minimum score is also enforced.

The drawer receives points for correct guesses made by other players.

At the end of the game, players are sorted according to their scores and the highest-scoring player is identified as the winner.

---

# 📝 Word Matching

Guesses are normalized before comparison.

For example:

```js
const normalizedGuess = guess.trim().toLowerCase();

const normalizedWord = currentWord.toLowerCase();
```

Therefore:

```text
"Apple"
" apple "
"APPLE"
```

are treated as the same guess.

The current implementation uses exact word matching rather than partial matching.

---

# 💻 Local Development

## Prerequisites

Install:

- Node.js
- npm

No MongoDB installation is required for the current version.

---

## Backend

Open a terminal:

```bash
cd backend
npm install
npm run dev
```

The backend runs on:

```text
http://localhost:3000
```

---

## Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server normally runs on:

```text
http://localhost:5173
```

---

# 🔐 Environment Variables

## Backend

Create:

```text
backend/.env
```

```env
PORT=3000
CLIENT_URL=http://localhost:5173
```

---

## Frontend

Create:

```text
frontend/.env
```

```env
VITE_BACKEND_URL=http://localhost:3000
```

For production, `VITE_BACKEND_URL` should contain the deployed backend URL.

Example:

```env
VITE_BACKEND_URL=https://your-backend.onrender.com
```

Do not commit `.env` files to GitHub.

---

# ☁️ Deployment

The application can be deployed using a frontend static-site service and a Node.js WebSocket backend.

For the current project, the deployment architecture is:

```text
Render Static Site
       │
       │ Socket.IO
       ▼
Render Web Service
       │
       ▼
In-memory Game State
```

## Backend Deployment

Use the `backend` directory as the root directory.

Build command:

```bash
npm install
```

Start command:

```bash
npm start
```

Set:

```text
CLIENT_URL=https://YOUR-FRONTEND-URL.onrender.com
```

The backend uses the platform-provided `PORT`.

---

## Frontend Deployment

Use the `frontend` directory as the root directory.

Build command:

```bash
npm install && npm run build
```

Publish directory:

```text
dist
```

Set:

```text
VITE_BACKEND_URL=https://YOUR-BACKEND-URL.onrender.com
```

---

# ⚠️ Important Deployment Note

The current application stores active game state in server memory.

Therefore:

- Active rooms exist only while the backend process is running.
- Restarting the backend clears active rooms.
- Scores and game state are not persisted between server restarts.

Persistent storage is not required for the current implementation.

---

# 🧪 Testing the Multiplayer Game

After deployment, open the application in two browser windows.

### Browser 1

1. Enter a username.
2. Create a room.
3. Copy the room code.

### Browser 2

1. Enter another username.
2. Enter the room code.
3. Join the room.

Then:

1. Host starts the game.
2. Drawer receives word choices.
3. Drawer selects a word.
4. Other players see the drawing.
5. Players submit guesses.
6. Correct guesses receive points.
7. The round ends.
8. The next player becomes the drawer.
9. Rounds continue until the configured number is reached.
10. Final leaderboard is displayed.

---

# 📌 Assignment Requirements Covered

The implementation covers the main required flow:

- Multiplayer rooms
- Room creation
- Room joining
- Lobby
- Host-controlled game start
- Turn-based drawing
- Real-time drawing synchronization
- Word selection
- Guessing
- Scoring
- Leaderboard
- Winner determination
- Chat
- Drawing tools
- Configurable room settings
- Public deployment

---

# 🔮 Possible Future Improvements

The current implementation can be extended with:

- Hints
- Word categories
- Custom word lists
- Player avatars
- Kick/ban functionality
- Votekick
- Spectator mode
- Drawing replay
- Persistent game history
- User authentication
- Multiple languages
- More advanced moderation

---

# 👨‍💻 Author

**Hridyansh Pandey**

Built as a full-stack multiplayer drawing and guessing game project.