const express = require("express");
const app = express();

//socket.io setup
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 });

const port = 3000;

// Serve public directory
app.use(express.static(__dirname + "/../public"));

// Serve client directory
app.use("/client", express.static(__dirname + "/../client"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/../public/index.html");
});

server.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});
console.log("Server loaded");

io.on("connection", (socket) => {
  console.log("a user connected");
});
