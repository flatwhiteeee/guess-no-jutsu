const {
  createRoom,
  joinRoom,
  getPlayers,
  getRoomData,
  leaveRoom,
  disconnectPlayer,
  approveReconnect,
  toggleReady,
  canStartGame,
  startGame,
  resetGame,
  useAnswer,
  checkAnswer,
  isGameFinished,
  updateRoomSettings,
  isHost,
} = require("../services/roomService");

const {
  assignCharacters,
  createTurnOrder,
  startTurnTimer,
  getPlayerTimeLeft,
  stopTurnTimer,
  refreshTurnOrder,
  getCurrentTurn,
  nextTurn,
  useQuestion,
} = require("../services/gameService");

function registerRoomHandlers(io, socket) {
  // =========================
  // CREATE ROOM
  // =========================
  socket.on("create-room", (settings) => {
    console.log("CREATE ROOM EVENT");
    console.log(settings);

    const roomCode = createRoom(socket.id, settings);

    console.log(roomCode);

    socket.join(roomCode);

    socket.emit("players-updated", getPlayers(roomCode));

    socket.emit("room-created", roomCode);
    const room = getRoomData(roomCode);

    const host = room.players.find((p) => p.id === socket.id);

    socket.emit("session-created", {
      roomCode,
      sessionId: host.sessionId,
    });
  });

  // =========================
  // JOIN ROOM
  // =========================
  socket.on("join-room", ({ roomCode, playerName, sessionId }) => {
    const result = joinRoom(roomCode, socket.id, playerName, sessionId);
    if (result.reconnect) {
      console.log("RECONNECT REQUEST", {
        roomCode,
        player: result.player.name,
      });

      const room = getRoomData(roomCode);

      if (!room) return;

      io.to(room.host).emit("reconnect-request", {
        playerName: result.player.name,
        sessionId: result.player.sessionId,
        socketId: socket.id,
      });

      return;
    }
    if (!result.success) {
      socket.emit("join-failed", result.message);
      return;
    }

    socket.join(roomCode);

    io.to(roomCode).emit("players-updated", getPlayers(roomCode));

    console.log("Player Joined:", roomCode);

    socket.emit("join-success", roomCode);
    const room = getRoomData(roomCode);

    const player = room.players.find((p) => p.id === socket.id);

    socket.emit("session-created", {
      roomCode,
      sessionId: player.sessionId,
    });
  });

  // =========================
  // ROOM DATA
  // =========================
  socket.on("get-room-data", (roomCode) => {
    const room = getRoomData(roomCode);

    if (!room) return;

    socket.emit("room-data", room);
  });

  socket.on("get-players", (roomCode) => {
    socket.emit("players-updated", getPlayers(roomCode));
  });

  // =========================
  // UPDATE ROOM SETTINGS
  // =========================
  socket.on("update-room-settings", ({ roomCode, difficulty, maxPlayers }) => {
    const room = getRoomData(roomCode);

    if (!room) {
      socket.emit("update-room-settings-failed", "Room tidak ditemukan.");
      return;
    }

    // Hanya host yang boleh mengubah setting
    if (!isHost(roomCode, socket.id)) {
      socket.emit(
        "update-room-settings-failed",
        "Hanya host yang dapat mengubah setting room.",
      );
      return;
    }

    // Setting hanya bisa diubah selama lobby
    if (room.status !== "lobby") {
      socket.emit(
        "update-room-settings-failed",
        "Setting tidak dapat diubah setelah game dimulai.",
      );
      return;
    }

    // Jangan sampai max player lebih kecil dari jumlah player yang sudah ada
    if (maxPlayers < room.players.length) {
      socket.emit(
        "update-room-settings-failed",
        `Maximum players tidak boleh kurang dari jumlah player saat ini (${room.players.length}).`,
      );
      return;
    }

    const updatedRoom = updateRoomSettings(roomCode, {
      difficulty,
      maxPlayers,
    });

    if (!updatedRoom) {
      socket.emit(
        "update-room-settings-failed",
        "Gagal memperbarui setting room.",
      );
      return;
    }

    // Kirim room terbaru ke semua player
    io.to(roomCode).emit("room-data", updatedRoom);
  });

  // =========================
  // READY
  // =========================
  socket.on("toggle-ready", (roomCode) => {
    const players = toggleReady(roomCode, socket.id);

    io.to(roomCode).emit("players-updated", players);
  });

  // =========================
  // LEAVE ROOM
  // =========================
  socket.on("leave-room", (roomCode) => {
    const room = leaveRoom(socket.id);

    socket.leave(roomCode);

    if (!room) return;

    if (room.roomClosed) {
      io.to(roomCode).emit("room-closed");
      return;
    }
    if (room.status === "playing" && !isGameFinished(room.roomCode)) {
      refreshTurnOrder(room);
    }

    io.to(room.roomCode).emit("players-updated", room.players);

    if (room.status === "playing") {
      const winners = room.players.filter((p) => p.solved);

      const losers = room.players.filter((p) => p.failed);

      io.to(room.roomCode).emit("game-finished", {
        room,
        winners,
        losers,
      });
    }

    console.log("Player Left Lobby:", socket.id);
  });

  // =========================
  // START GAME
  // =========================
  socket.on("start-game", (roomCode) => {
    const result = canStartGame(roomCode, socket.id);

    if (!result.allowed) {
      socket.emit("start-game-failed", result.message);
      return;
    }

    const room = startGame(roomCode);

    assignCharacters(room.players, room.difficulty);

    room.turnOrder = createTurnOrder(room.players);

    const currentTurn = getCurrentTurn(room);

    startTurnTimer(room);

    io.to(roomCode).emit("game-state", {
      room,
      currentTurn,
    });
  });
  // =========================
  // PLAY AGAIN
  // =========================
  socket.on("play-again", (roomCode) => {
    const room = resetGame(roomCode);

    if (!room) return;

    assignCharacters(room.players, room.difficulty);

    room.turnOrder = createTurnOrder(room.players);

    const currentTurn = getCurrentTurn(room);

    startTurnTimer(room);
    io.to(roomCode).emit("play-again");
    io.to(roomCode).emit("game-state", {
      room,
      currentTurn,
    });
  });
  // =========================
  // NEXT TURN
  // =========================
  socket.on("next-turn", (roomCode) => {
    const room = getRoomData(roomCode);

    if (!room) return;

    if (room.turnIndex >= room.turnOrder.length - 1) {
      return;
    }

    // =========================
    // STOP TIMER PLAYER SAAT INI
    // =========================
    stopTurnTimer(room);

    // Player yang baru selesai memakai 1 question
    useQuestion(room);

    refreshTurnOrder(room);

    if (isGameFinished(roomCode)) {
      const winners = room.players.filter((p) => p.solved);
      const losers = room.players.filter((p) => p.failed);

      io.to(roomCode).emit("game-finished", {
        room,
        winners,
        losers,
      });

      return;
    }

    let currentTurn = "";

    if (room.turnOrder.length > 0) {
      currentTurn = nextTurn(room);

      // =========================
      // START TIMER PLAYER BERIKUTNYA
      // =========================
      startTurnTimer(room);
    }

    io.to(roomCode).emit("game-state", {
      room,
      currentTurn,
    });
  });

  // =========================
  // TIMER EXPIRED
  // =========================
  socket.on("timer-expired", (roomCode) => {
    const room = getRoomData(roomCode);

    if (!room) return;

    // Pastikan memang masih ada turn
    if (room.turnOrder.length === 0) return;

    const currentPlayerId = room.turnOrder[room.turnIndex];

    // Hanya current player yang boleh menghabiskan waktu
    if (currentPlayerId !== socket.id) return;

    const player = room.players.find((p) => p.id === socket.id);

    if (!player) return;

    // Pastikan timer benar-benar sudah habis
    const timeLeft = getPlayerTimeLeft(player);

    if (timeLeft > 0) return;

    // Simpan timer sebagai 0 dan hentikan timer
    stopTurnTimer(room);

    player.timerLeft = 0;
    player.failed = true;

    // Keluarkan player dari turn order
    refreshTurnOrder(room);

    // Beritahu semua player bahwa player ini kehabisan waktu
    io.to(socket.id).emit("time-expired", {
      playerName: player.name,
    });

    // Cek apakah game selesai
    if (isGameFinished(roomCode)) {
      const winners = room.players.filter((p) => p.solved);
      const losers = room.players.filter((p) => p.failed);

      io.to(roomCode).emit("game-finished", {
        room,
        winners,
        losers,
      });

      return;
    }

    let currentTurn = "";

    if (room.turnOrder.length > 0) {
      currentTurn = getCurrentTurn(room);

      startTurnTimer(room);
    }

    io.to(roomCode).emit("game-state", {
      room,
      currentTurn,
    });
  });
  // =========================
  // NEXT ROUND
  // =========================
  socket.on("next-round", (roomCode) => {
    const room = getRoomData(roomCode);

    if (!room) return;

    // =========================
    // STOP TIMER PLAYER TERAKHIR
    // =========================
    stopTurnTimer(room);

    // Player terakhir dalam ronde juga menghabiskan 1 question
    useQuestion(room);

    refreshTurnOrder(room);
    if (isGameFinished(roomCode)) {
      const winners = room.players.filter((p) => p.solved);

      const losers = room.players.filter((p) => p.failed);

      io.to(roomCode).emit("game-finished", {
        room,
        winners,
        losers,
      });

      return;
    }

    if (room.currentRound >= 10) {
      const winners = room.players.filter((player) => player.solved);

      const losers = room.players.filter((player) => player.failed);

      io.to(roomCode).emit("game-finished", {
        room,
        winners,
        losers,
      });

      return;
    }

    room.players.forEach((player) => {
      player.answeredThisRound = false;
    });

    room.currentRound++;

    room.turnIndex = 0;

    let currentTurn = "";

    if (room.turnOrder.length > 0) {
      currentTurn = getCurrentTurn(room);

      // =========================
      // START TIMER PLAYER
      // DI ROUND BARU
      // =========================
      startTurnTimer(room);
    }

    io.to(roomCode).emit("game-state", {
      room,
      currentTurn,
    });
  });

  // =========================
  // DISCONNECT
  // =========================
  socket.on("disconnect", () => {
    const room = disconnectPlayer(socket.id);

    if (!room) return;

    if (room.roomClosed) {
      io.to(room.roomCode).emit("room-closed");
      return;
    }

    // =========================
    // PAUSE TIMER JIKA PLAYER
    // DISCONNECT SAAT GILIRAN
    // =========================
    const currentPlayerId = room.turnOrder[room.turnIndex];

    if (room.status === "playing" && currentPlayerId === socket.id) {
      stopTurnTimer(room);
    }

    io.to(room.roomCode).emit("players-updated", room.players);

    const currentTurn = room.turnOrder.length > 0 ? getCurrentTurn(room) : "";

    io.to(room.roomCode).emit("game-state", {
      room,
      currentTurn,
    });

    console.log("Player Left:", socket.id);
  });
  socket.on("approve-reconnect", ({ sessionId, socketId }) => {
    const result = approveReconnect(sessionId, socketId);

    if (!result.success) return;

    const reconnectSocket = io.sockets.sockets.get(socketId);

    if (!reconnectSocket) return;

    reconnectSocket.join(result.room.roomCode);

    if (
      result.room.status === "playing" &&
      result.room.turnOrder[result.room.turnIndex] === socketId
    ) {
      startTurnTimer(result.room);
    }

    const currentTurn = getCurrentTurn(result.room);

    io.to(socketId).emit("reconnect-approved", {
      room: result.room,
      currentTurn,
    });

    io.to(result.room.roomCode).emit("game-state", {
      room: result.room,
      currentTurn,
    });

    console.log("RECONNECT BERHASIL:", result.player.name);
  });
  // =========================
  // SUBMIT ANSWER
  // =========================
  socket.on("submit-answer", ({ roomCode, answer }) => {
    const room = getRoomData(roomCode);

    if (!room) return;
    if (!answer || answer.trim() === "") {
      socket.emit("answer-result", "empty_answer");
      return;
    }
    // Round pertama belum boleh menjawab
    if (room.currentRound === 1) {
      socket.emit("answer-result", "answer_locked");
      return;
    }

    const player = room.players.find((p) => p.id === socket.id);

    if (!player) return;
    // Pastikan hanya pemain yang sedang mendapat giliran yang boleh menjawab
    const currentPlayerId = room.turnOrder[room.turnIndex];

    if (socket.id !== currentPlayerId) {
      socket.emit("answer-result", "not_your_turn");
      return;
    }

    // Sudah berhasil menebak
    // Sudah kehabisan kesempatan menjawab
    if (player.failed) {
      socket.emit("answer-result", "out_of_answers");
      return;
    }
    if (player.solved) {
      socket.emit("answer-result", "already_solved");
      return;
    }

    // Sudah menggunakan kesempatan menjawab di ronde ini
    if (player.answeredThisRound) {
      socket.emit("answer-result", "already_answered");
      return;
    }

    const result = checkAnswer(roomCode, socket.id, answer);

    if (!result) return;
    // Tandai bahwa player sudah memakai kesempatan menjawab di ronde ini
    result.player.answeredThisRound = true;

    // Langsung keluarkan dari turn jika sudah selesai bermain
    // Langsung keluarkan dari turn jika sudah selesai bermain
    if (result.player.solved || result.player.failed) {
      refreshTurnOrder(result.room);

      if (result.room.turnOrder.length > 0) {
        startTurnTimer(result.room);
      }
    }

    const currentTurn =
      result.room.turnOrder.length > 0 ? getCurrentTurn(result.room) : "";

    io.to(roomCode).emit("game-state", {
      room: result.room,
      currentTurn,
    });
    if (isGameFinished(roomCode)) {
      const room = getRoomData(roomCode);

      const winners = room.players.filter((p) => p.solved);

      const losers = room.players.filter((p) => p.failed);

      io.to(roomCode).emit("game-finished", {
        room,
        winners,
        losers,
      });

      return;
    }

    if (!result.correct && result.player.failed) {
      socket.emit("answer-result", "eliminated");
    } else {
      socket.emit("answer-result", result.correct);
    }

    console.log(result.player.name, result.correct ? "CORRECT" : "WRONG");
  });
}

module.exports = registerRoomHandlers;
