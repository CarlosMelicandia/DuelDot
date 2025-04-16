const playerNames = [
  "Shadow","Raven",
  "Phoenix","Blaze",
  "Viper","Maverick",
  "Rogue","Hunter",
  "Nova","Zephyr",
  "Falcon","Titan",
  "Specter","Cyclone",
  "Inferno","Reaper",
  "Stalker","Venom",
  "Glitch","Banshee",
  "Shadowstrike","Onyx",
  "Rebel","Fury",
  "Apex","Crimson",
  "Nightfall","Saber",
  "Tempest","Lightning",
  "Bullet","Vortex",
  "Echo","Blitz",
  "Rift","BOB",
];

// ------------------------------
// Username Form Handling
// ------------------------------
/**
 * When the player submits their username (or chosen random name):
 * - Prevent default form submission
 * - Hide the username form
 * - Emit an 'initGame' event to the server with our chosen data
 */

function selectName() {
  let playerNameNumber = Math.floor(Math.random() * playerNames.length);
  let name = playerNames[playerNameNumber];
  for (const id in frontEndPlayers) {
    if (frontEndPlayers[id] === name) {
      // If name is already taken by a current player, try again
      return selectName();
    }
  }
  return name;
}

let playerName = selectName();
document.querySelector("#name-box").textContent = playerName;

document.querySelector("#random-btn").addEventListener("click", () => {
  // Generate a new random name when clicked
  playerName = selectName();
  document.querySelector("#name-box").textContent = playerName;
});



document.querySelector('#submit-btn').addEventListener('click', (event) => {
  event.preventDefault() // Prevents the form from refreshing
  gameStarted = true

  animate()
  
  // Send data to the server to initialize the player
  socket.emit("initGame", {
    width: canvas.width,
    height: canvas.height,
    devicePixelRatio,
    username: playerName,
    className,
  })
});