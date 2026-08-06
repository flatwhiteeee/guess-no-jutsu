const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const registerRoomHandlers = require("./socket/roomHandlers");

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  res.send("Guess no Jutsu Server Running");
});

io.on("connection", (socket) => {
  console.log("Player Connected:", socket.id);

  registerRoomHandlers(io, socket);
});

server.listen(3001, () => {
  console.log("Server running on port 3001");
});
