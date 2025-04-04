// Update LeaderBoard when ever new player joins, player dies, or player leaves
socket.on("updateRanking", (topPlayers, backEndPlayers) => {
    // Check if the local player exist in the frontEndPlayers
    // If not, log a warning and return
    if (!frontEndPlayers[socket.id]) {
      console.warn(`Player ${socket.id} not exist in frontEndPlayers`);
      return;
    }
  
    // Check if the local player is in the top 10 players in terms of score
    const localPlayerInTop = topPlayers.some((p) => p.id === socket.id);
  
    // If the local player is not in the top 10, mark them not rank and add them into the topPlayers array
    if (!localPlayerInTop) {
      frontEndPlayers[socket.id].notRanked = true;
      topPlayers.push(frontEndPlayers[socket.id]);
    }
  
    // Find and clear the small leaderboard
    const parentDiv = document.querySelector("#update-sleaderboard");
    parentDiv.innerHTML = "";
  
    // Loop through the topPlayers array and display them on the small leaderboard
    // If a player mark unranked, display "X" as their rank
    topPlayers.forEach((entry, index) => {
      let rankDisplay = entry.notRanked ? "X" : index + 1;
      const div = document.createElement("div");
      div.setAttribute("data-id", entry.id);
      div.setAttribute("data-score", entry.score);
      div.setAttribute("data-username", entry.username);
      div.style.display = "flex";
      div.style.justifyContent = "space-between";
      div.style.width = "100%";
      div.style.color = entry.color;
      div.innerHTML = `<span><strong>${rankDisplay}.</strong> ${entry.username}</span><span>${entry.score}</span>`;
      parentDiv.appendChild(div);
    });
  
    // If lag being cause, make this more efficient instead of clearing the big leaderboard everytime
    const bigLeaderBoard = document.querySelector("#playerLabelsLead");
    bigLeaderBoard.innerHTML = "";
  
    // Loop through backEndPlayers and display them on the big leaderboard
    for (const id in backEndPlayers) {
      const backendPlayer = backEndPlayers[id];
      document.querySelector("#playerLabelsLead").innerHTML += `
            <tr>
              <td>${backendPlayer.class}</td>
              <td>${backendPlayer.username}</td>
              <td data-id="${id}score">${backendPlayer.score}</td>
              <td data-id="${id}weapon">Nothing</td>
              <td>55%</td>
            </tr>`;
    }
  });