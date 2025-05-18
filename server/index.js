// server/index.js
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  pingInterval: 2000,
  pingTimeout: 5000,
  cors: {
    origin: "*", // Adjust in production
    methods: ["GET", "POST"],
  },
});

const port = 3000;

// Serve static files
app.use(express.static(__dirname + "/../public"));
app.use("/client", express.static(__dirname + "/../client"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/../public/index.html");
});

const players = {};

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle player joining
  socket.on("join", (userData) => {
    console.log(`Player ${userData.username} joined with ID: ${socket.id}`);

    // Store player data
    players[socket.id] = {
      id: socket.id,
      username: userData.username,
      position: userData.position || {
        x: -300, // Default starting position aligned with your map offset
        y: -1100,
      },
      lastKey: userData.lastKey || "s", // Default facing down
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`, // Random color for player marker
    };

    // Send existing players to the new player
    socket.emit("currentPlayers", players);

    // Notify all other players about the new player
    socket.broadcast.emit("newPlayer", players[socket.id]);
  });

  // Handle player movement
  socket.on("playerMovement", (movementData) => {
    if (players[socket.id]) {
      players[socket.id].position = movementData.position;
      players[socket.id].lastKey = movementData.lastKey;

      // Broadcast updated position to all other players
      socket.broadcast.emit("playerMoved", {
        id: socket.id,
        position: players[socket.id].position,
        lastKey: players[socket.id].lastKey,
      });
    }
  });

  // Handle chat messages
  socket.on("chatMessage", (message) => {
    if (players[socket.id]) {
      io.emit("chatMessage", {
        id: socket.id,
        username: players[socket.id].username,
        message: message,
      });
    }
  });

  // Handle player disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // Remove player from our players object
    if (players[socket.id]) {
      // Notify other players
      io.emit("playerDisconnected", socket.id);

      // Delete player data
      delete players[socket.id];
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
