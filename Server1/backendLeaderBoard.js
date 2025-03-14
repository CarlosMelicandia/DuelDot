

function updateLeaderBoard(backendPlayers, io) {
  let playersArray = Object.entries(backendPlayers).map(([id, player]) => ({
    id,
    username: player.username,
    score: player.score,
    color: player.color
  }));

  playersArray.sort((a, b) => b.score - a.score);

  let topPlayers = playersArray.slice(0, 10);

  io.emit("updateRanking", topPlayers);
}

module.exports = { updateLeaderBoard };