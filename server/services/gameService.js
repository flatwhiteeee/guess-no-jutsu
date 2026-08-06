const characters = require("../data/narutoCharacters");

function shuffle(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function assignCharacters(players) {
  const randomCharacters = shuffle(characters);

  players.forEach((player, index) => {
    player.character = randomCharacters[index].name;
  });
}

function createTurnOrder(players) {
  const shuffled = shuffle(players);

  return shuffled.map((player) => player.id);
}

function refreshTurnOrder(room) {
  room.turnOrder = room.turnOrder.filter((playerId) => {
    const player = room.players.find((p) => p.id === playerId);

    if (!player) return false;

    // Sudah berhasil menebak
    if (player.solved) return false;

    if (player.failed) return false;

    return true;
  });

  if (room.turnIndex >= room.turnOrder.length) {
    room.turnIndex = room.turnOrder.length - 1;
  }

  if (room.turnIndex < 0) {
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
  refreshTurnOrder,
  getCurrentTurn,
  nextTurn,
  useQuestion,
};
