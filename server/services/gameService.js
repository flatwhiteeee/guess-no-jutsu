const characters = require("../data/narutoCharacters");

function shuffle(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function assignCharacters(players, difficulty) {
  const difficultyData = characters[difficulty.toLowerCase()];

  if (!difficultyData) {
    console.error("Invalid difficulty:", difficulty);
    return;
  }

  const questionPool = difficultyData.categories.flatMap(
    (category) => difficultyData[category] || [],
  );

  const randomCharacters = shuffle(questionPool);

  players.forEach((player, index) => {
    player.character = randomCharacters[index].name;
  });
}

function createTurnOrder(players) {
  const shuffled = shuffle(players);

  return shuffled.map((player) => player.id);
}

function startTurnTimer(room) {
  const currentId = room.turnOrder[room.turnIndex];

  const player = room.players.find((p) => p.id === currentId);

  if (!player) return;

  if (!player.connected) return;

  player.timerStartedAt = Date.now();
}

function getPlayerTimeLeft(player) {
  if (!player.timerStartedAt) {
    return player.timerLeft;
  }

  const elapsedSeconds = Math.floor(
    (Date.now() - player.timerStartedAt) / 1000,
  );

  return Math.max(player.timerLeft - elapsedSeconds, 0);
}

function stopTurnTimer(room) {
  const currentId = room.turnOrder[room.turnIndex];

  const player = room.players.find((p) => p.id === currentId);

  if (!player) return;

  player.timerLeft = getPlayerTimeLeft(player);
  player.timerStartedAt = null;
}

function refreshTurnOrder(room) {
  const currentId = room.turnOrder[room.turnIndex];

  room.turnOrder = room.turnOrder.filter((playerId) => {
    const player = room.players.find((p) => p.id === playerId);

    if (!player) return false;

    if (player.solved) return false;

    if (player.failed) return false;

    return true;
  });

  if (room.turnOrder.length === 0) {
    room.turnIndex = 0;
    return;
  }

  const currentIndex = room.turnOrder.indexOf(currentId);

  if (currentIndex !== -1) {
    room.turnIndex = currentIndex;
    return;
  }

  if (room.turnIndex >= room.turnOrder.length) {
    room.turnIndex = 0;
  }
}

function getCurrentTurn(room) {
  const currentId = room.turnOrder[room.turnIndex];

  const player = room.players.find((p) => p.id === currentId);

  return player ? player.name : "";
}

function nextTurn(room) {
  if (room.turnIndex < room.turnOrder.length - 1) {
    room.turnIndex++;
  }

  return getCurrentTurn(room);
}

function useQuestion(room) {
  const currentId = room.turnOrder[room.turnIndex];

  const player = room.players.find((p) => p.id === currentId);

  if (!player) return;

  if (player.questionLeft > 0) {
    player.questionLeft--;
  }

  if (player.questionLeft <= 0) {
    player.questionLeft = -1;
    player.answerLeft = -1;
    player.failed = true;
  }
}

module.exports = {
  assignCharacters,
  createTurnOrder,
  startTurnTimer,
  getPlayerTimeLeft,
  stopTurnTimer,
  refreshTurnOrder,
  getCurrentTurn,
  nextTurn,
  useQuestion,
};
