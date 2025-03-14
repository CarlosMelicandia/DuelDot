function updateLeaderBoard(backEndPlayers, io) {
  
  let playersArray = Object.entries(backEndPlayers).map(([id, player]) => ({
    id,
    username: player.username,
    score: player.score,
    color: player.color
  }));

  playersArray.sort((a, b) => b.score - a.score);

  let topPlayers = playersArray.slice(0, 10);

  io.emit("updateRanking", topPlayers, backEndPlayers);
}

module.exports = { updateLeaderBoard };