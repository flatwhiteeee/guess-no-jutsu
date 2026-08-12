const generateRoomCode = require("../utils/generateRoomCode");
const crypto = require("crypto");
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
        sessionId: crypto.randomUUID(),
        name: settings.playerName,

        ready: false,

        character: null,

        questionLeft: 10,

        answerLeft: 3,

        timerLeft: 6 * 60,
        timerStartedAt: null,

        solved: false,
        failed: false,

        answeredThisRound: false,

        connected: true,
        leftGame: false,
      },
    ],
  };

  return roomCode;
}

function getRoom(roomCode) {
  return rooms[roomCode];
}
function joinRoom(roomCode, socketId, playerName, sessionId = null) {
  const room = rooms[roomCode];

  // Reconnect hanya berlaku ketika game sedang berjalan
  if (room && room.status === "playing" && sessionId) {
    const existingPlayer = room.players.find((p) => p.sessionId === sessionId);
    console.log("=== RECONNECT DEBUG ===");

    console.log("Input Player :", playerName);
    console.log("Input Session:", sessionId);

    console.log(
      "Semua Player:",
      room.players.map((p) => ({
        name: p.name,
        sessionId: p.sessionId,
      })),
    );

    console.log("Matched:", existingPlayer?.name);

    if (existingPlayer) {
      return {
        success: false,
        reconnect: true,
        player: existingPlayer,
      };
    }
  }

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
    sessionId: crypto.randomUUID(),
    name: playerName,

    ready: false,

    character: null,

    questionLeft: 10,

    answerLeft: 3,
    timerLeft: 6 * 60,
    timerStartedAt: null,

    solved: false,
    failed: false,

    answeredThisRound: false,

    connected: true,
    leftGame: false,
  });
  console.log(
    room.players.map((p) => ({
      name: p.name,
      sessionId: p.sessionId,
    })),
  );

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

  room.category = settings.category || room.category;
  room.difficulty = settings.difficulty || room.difficulty;
  room.maxPlayers = settings.maxPlayers || room.maxPlayers;

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

function disconnectPlayer(socketId) {
  for (const roomCode in rooms) {
    const room = rooms[roomCode];

    const player = room.players.find((p) => p.id === socketId);

    if (!player) continue;

    // =========================
    // HOST DISCONNECT
    // =========================
    if (room.host === socketId) {
      room.roomClosed = true;

      delete rooms[roomCode];

      return room;
    }

    // =========================
    // PLAYER BIASA DISCONNECT
    // =========================
    player.connected = false;

    return room;
  }

  return null;
}

function approveReconnect(sessionId, newSocketId) {
  for (const roomCode in rooms) {
    const room = rooms[roomCode];

    const player = room.players.find((p) => p.sessionId === sessionId);

    if (!player) continue;

    const oldSocketId = player.id;

    player.id = newSocketId;
    player.connected = true;

    // Update turnOrder agar tetap menunjuk player yang benar
    room.turnOrder = room.turnOrder.map((id) =>
      id === oldSocketId ? newSocketId : id,
    );

    return {
      success: true,
      room,
      player,
    };
  }

  return {
    success: false,
  };
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
    player.leftGame = false;
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

    player.questionLeft = 10;
    player.answerLeft = 3;

    player.timerLeft = 6 * 60;
    player.timerStartedAt = null;

    player.solved = false;
    player.failed = false;
    player.answeredThisRound = false;
  });

  return room;
}
function returnToLobby(roomCode) {
  const room = rooms[roomCode];

  if (!room) return null;

  const wasPlaying = room.status === "playing";

  room.status = "lobby";
  room.currentRound = 0;
  room.turnIndex = 0;
  room.turnOrder = [];

  room.players.forEach((player) => {
    if (wasPlaying) {
      player.ready = false;
    }

    player.character = null;

    player.questionLeft = 10;
    player.answerLeft = 3;

    player.timerLeft = 6 * 60;
    player.timerStartedAt = null;

    player.solved = false;
    player.failed = false;
    player.answeredThisRound = false;
  });

  return room;
}
function leaveGame(roomCode, socketId) {
  const room = rooms[roomCode];

  if (!room) return null;

  const player = room.players.find((p) => p.id === socketId);

  if (!player) return null;

  const leavingPlayerIndex = room.turnOrder.indexOf(socketId);
  const wasCurrentTurn = leavingPlayerIndex === room.turnIndex;

  player.leftGame = true;
  player.connected = true;
  player.ready = false;

  room.turnOrder = room.turnOrder.filter((playerId) => playerId !== socketId);

  if (room.turnOrder.length === 0) {
    room.turnIndex = 0;
  } else if (wasCurrentTurn) {
    // Player yang sedang mendapat giliran keluar.
    // Tetap gunakan index yang sama karena player berikutnya
    // otomatis bergeser ke posisi tersebut.
    if (room.turnIndex >= room.turnOrder.length) {
      room.turnIndex = 0;
    }
  } else if (leavingPlayerIndex < room.turnIndex) {
    // Player sebelum current turn dihapus,
    // sehingga index current turn harus mundur satu.
    room.turnIndex -= 1;
  }

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
    if (player.questionLeft > 0) {
      player.questionLeft--;
    }

    if (player.answerLeft > 0) {
      player.answerLeft--;
    }

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
    (player) => !player.solved && !player.failed && !player.leftGame,
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
  updateRoomSettings,
  toggleReady,
  leaveRoom,
  leaveGame,
  disconnectPlayer,
  approveReconnect,
  canStartGame,
  startGame,
  resetGame,
  returnToLobby,
  useAnswer,
  checkAnswer,
  isGameFinished,
};
