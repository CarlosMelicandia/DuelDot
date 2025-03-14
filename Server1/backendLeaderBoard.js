
function updateLeaderBoard(backEndPlayers, io) {
  /**
   * Turn backEndPlayers into an array of players
   * Each element will be a map of id (key) and player (value)
   */
  let playersArray = Object.entries(backEndPlayers).map(([id, player]) => ({
    id,
    username: player.username,
    score: player.score,
    color: player.color
  }));

  // Sort the array from highest to lowest
  playersArray.sort((a, b) => b.score - a.score);

  let topPlayers = playersArray.slice(0, 10);   

  io.emit("updateRanking", topPlayers, backEndPlayers);
}

module.exports = { updateLeaderBoard };