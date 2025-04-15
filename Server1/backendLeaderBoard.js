
function updateLeaderBoard(backEndPlayers, io, excludeId = null) {
  /**
   * Turn backEndPlayers into an array of players
   * Each element will be a map of id (key) and player (value)
   */
  let playersArray = Object.entries(backEndPlayers).map(([id, player]) => ({
    id,
    username: player.username,
    score: player.score,
    color: player.color,
    class: player.class,
  }));

  // Sort the array from highest to lowest
  playersArray.sort((a, b) => b.score - a.score);

  let topPlayers = playersArray.slice(0, 10);
  io.emit("updateRanking", topPlayers, playersArray, backEndPlayers);  
}

function updateKillFeed(backEndPlayers, backEndProjectiles, playerId, id, io) {
  const victimName = backEndPlayers[playerId].username;
  const weapon =
    backEndPlayers[backEndProjectiles[id].playerId].equippedWeapon.name;
  const killerName = backEndPlayers[backEndProjectiles[id].playerId].username;
  console.log(killerName + " killed " + victimName);

  io.emit("updateKillFeed", {
    victimId: playerId,
    killerId: backEndProjectiles[id].playerId,
    killerName: killerName,
    victimName: victimName,
    weapon: weapon,
  });
}

module.exports = {
  updateKillFeed,
  updateLeaderBoard,
};
