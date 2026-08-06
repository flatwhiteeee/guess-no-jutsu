const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const registerRoomHandlers = require("./socket/roomHandlers");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://guess-no-jutsu.vercel.app",
    ],
    credentials: true,
  }),
);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://guess-no-jutsu.vercel.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.get("/", (req, res) => {
  res.send("Guess no Jutsu Server Running");
});

io.on("connection", (socket) => {
  console.log("Player Connected:", socket.id);

  registerRoomHandlers(io, socket);
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
