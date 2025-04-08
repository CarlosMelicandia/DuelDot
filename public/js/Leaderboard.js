// ------------------------------
// Update LeaderBoard when ever new player joins, player dies, or player leaves
// ------------------------------
socket.on("updateRanking", (topPlayers, playersArray, backEndPlayers) => {
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
    frontEndPlayers[socket.id].score = backEndPlayers[socket.id].score; // Update frontEndPlayers[local player] score
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

  // Assign playersArray to globalPlayersArray for pagination
  // This is used for the pagniation of the big leaderboard
  globalPlayersArray = playersArray;
  updateLeaderboardPage(globalPlayersArray);
});

// Update the big leaderboard when the player dies
function updateLeaderboardPage (players) {
  // If lag being cause, make this more efficient instead of clearing the big leaderboard everytime
  const bigLeaderBoard = document.querySelector("#player-labels");
  bigLeaderBoard.innerHTML = "";

  // Calculate the number of pages, start/end player of each page, and the players per page
  numberOfPage = Math.ceil(players.length / rowPerPage);
  if (currentPage > numberOfPage) currentPage = numberOfPage; // Set currentPage to the last page if it exceeds the number of pages

  let startIndex = (currentPage - 1) * rowPerPage;
  let endIndex = startIndex + rowPerPage;
  let playersPerPage = players.slice(startIndex, endIndex);

  // Go through each of player inside the 10 players in playersPerPage and display them
  // Display the local player in colored text
  playersPerPage.forEach((entry, index) => {
    let rankDisplay = index + 1;

    const isLocalPlayer = entry.id === socket.id;
    const rowColor = isLocalPlayer ?  `style="color: ${entry.color};"` : "";
    document.querySelector("#player-labels").innerHTML += `
          <tr>
            <td ${rowColor}>${rankDisplay + startIndex}</td>
            <td>${entry.username}</td>
            <td data-id="${entry.id}score">${entry.score}</td>
            <td data-id="${entry.id}class">${entry.class}</td>
          </tr>`;
  });

  // Update the number of page in the big leaderboard
  document.getElementById("page-number").textContent = `${currentPage} / ${numberOfPage || 1}`;
}

// Update the big leaderboard page to previous page if have when click left arrow
document.getElementById("prev-page").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    updateLeaderboardPage(globalPlayersArray);
  }
});

// Update the big leaderboard page to next page if have when click left arrow
document.getElementById("next-page").addEventListener("click", () => {
  if (currentPage < numberOfPage) {
    currentPage++;
    updateLeaderboardPage(globalPlayersArray);
  }
});