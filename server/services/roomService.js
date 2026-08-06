const generateRoomCode = require("../utils/generateRoomCode");
const rooms = {};

function createRoom(hostSocketId, settings) {
  const roomCode = generateRoomCode();

  rooms[roomCode] = {
    roomCode,

    host: hostSocketId,

    category: settings.category,

    difficulty: settings.difficulty,

    maxPlayers: settings.maxPlayers,
    status: "lobby",
    round: 0,
    turnIndex: 0,
    turnOrder: [],
    currentRound: 0,

    players: [
      {
        id: hostSocketId,
        name: settings.playerName,

        ready: false,

        character: null,

        questionLeft: 8,

        answerLeft: 3,

        solved: false,
        failed: false,

        answeredThisRound: false,
      },
    ],
  };

  return roomCode;
}

function getRoom(roomCode) {
  return rooms[roomCode];
}
function joinRoom(roomCode, socketId, playerName) {
  const room = rooms[roomCode];

  if (!room) {
    return {
      success: false,
      message: "Room tidak ditemukan.",
    };
  }

  if (room.status !== "lobby") {
    return {
      success: false,
      message: "Game sudah dimulai.",
    };
  }

  if (room.players.length >= room.maxPlayers) {
    return {
      success: false,
      message: "Room sudah penuh.",
    };
  }

  room.players.push({
    id: socketId,
    name: playerName,

    ready: false,

    character: null,

    questionLeft: 8,

    answerLeft: 3,

    solved: false,
    failed: false,

    answeredThisRound: false,
  });

  return {
    success: true,
  };
}
function getPlayers(roomCode) {
  const room = rooms[roomCode];

  if (!room) {
    return [];
  }

  return room.players;
}
function getRoomData(roomCode) {
  return rooms[roomCode];
}
function updateRoomSettings(roomCode, settings) {
  const room = rooms[roomCode];

  if (!room) return null;

  room.category = settings.category;
  room.difficulty = settings.difficulty;
  room.maxPlayers = settings.maxPlayers;

  return room;
}
function isHost(roomCode, socketId) {
  const room = rooms[roomCode];

  if (!room) return false;

  return room.host === socketId;
}
function toggleReady(roomCode, socketId) {
  const room = rooms[roomCode];

  if (!room) return [];

  const player = room.players.find((p) => p.id === socketId);

  if (!player) return room.players;

  player.ready = !player.ready;

  return room.players;
}

function leaveRoom(socketId) {
  for (const roomCode in rooms) {
    const room = rooms[roomCode];

    const index = room.players.findIndex((player) => player.id === socketId);

    if (index === -1) continue;

    room.players.splice(index, 1);

    if (room.players.length === 0) {
      delete rooms[roomCode];
      return null;
    }

    if (room.host === socketId) {
      room.roomClosed = true;
      delete rooms[roomCode];
      return room;
    }

    return room;
  }

  return null;
}

function canStartGame(roomCode, socketId) {
  const room = rooms[roomCode];

  if (!room) {
    return {
      allowed: false,
      message: "Room tidak ditemukan.",
    };
  }

  if (room.host !== socketId) {
    return {
      allowed: false,
      message: "Hanya host yang bisa memulai permainan.",
    };
  }

  if (room.players.length !== room.maxPlayers) {
    return {
      allowed: false,
      message: `Room belum penuh (${room.players.length}/${room.maxPlayers} pemain).`,
    };
  }

  const allReady = room.players.every((player) => player.ready);

  if (!allReady) {
    return {
      allowed: false,
      message: "Masih ada pemain yang belum Ready.",
    };
  }

  return {
    allowed: true,
  };
}
function startGame(roomCode) {
  const room = rooms[roomCode];

  if (!room) return null;

  room.status = "playing";
  room.currentRound = 1;

  room.players.forEach((player) => {
    player.failed = false;
    player.solved = false;
    player.answeredThisRound = false;
  });

  return room;
}
function resetGame(roomCode) {
  const room = rooms[roomCode];

  if (!room) return null;

  room.status = "playing";
  room.currentRound = 1;
  room.turnIndex = 0;

  room.players.forEach((player) => {
    player.ready = false;
    player.character = null;

    player.questionLeft = 8;
    player.answerLeft = 3;

    player.solved = false;
    player.failed = false;
    player.answeredThisRound = false;
  });

  return room;
}
function useAnswer(roomCode, socketId) {
  const room = rooms[roomCode];

  if (!room) return null;

  const player = room.players.find((p) => p.id === socketId);

  if (!player) return null;

  if (player.answerLeft > 0) {
    player.answerLeft--;
  }

  return player;
}
function checkAnswer(roomCode, socketId, answer) {
  const room = rooms[roomCode];

  if (!room) return null;

  const player = room.players.find((p) => p.id === socketId);

  if (!player) return null;

  const correct =
    player.character.toLowerCase().trim() === answer.toLowerCase().trim();

  if (!correct) {
    if (player.answerLeft > 0) {
      player.answerLeft--;
    }

    if (player.answerLeft <= 0) {
      player.answerLeft = -1;
      player.questionLeft = -1;
      player.failed = true;
    }

    if (player.questionLeft <= 0) {
      player.answerLeft = -1;
      player.questionLeft = -1;
      player.failed = true;
    }
  } else {
    player.solved = true;
  }

  return {
    correct,
    player,
    room,
  };
}
function isGameFinished(roomCode) {
  const room = rooms[roomCode];

  if (!room) return false;

  const activePlayers = room.players.filter(
    (player) => !player.solved && !player.failed,
  );

  return activePlayers.length === 0;
}
module.exports = {
  createRoom,
  getRoom,
  joinRoom,
  getPlayers,
  getRoomData,
  isHost,
  toggleReady,
  leaveRoom,
  canStartGame,
  startGame,
  resetGame,
  useAnswer,
  checkAnswer,
  isGameFinished,
};
