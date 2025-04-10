// ------------------------------
// Canvas and Context Setup
// ------------------------------
const canvas = document.querySelector("canvas"); // Finds the canvas element from the HTML file
const c = canvas.getContext("2d"); // Context in which the canvas is being made

// ------------------------------
// Socket.IO and DOM Element Setup
// ------------------------------
const socket = io(); // Allows for communication between the client and the server
const scoreEl = document.querySelector("#scoreEl"); // Finds the element with ID "scoreEl" from the HTML file

// ------------------------------
// Device Pixel Ratio and Canvas Dimensions
// ------------------------------
const devicePixelRatio = window.devicePixelRatio || 1; // Gets the device's pixel ratio (for high-DPI displays), defaulting to 1 if unavailable

canvas.width = 1024 * devicePixelRatio; // Sets the canvas’s internal width
canvas.height = 576 * devicePixelRatio; // Sets the canvas’s internal height

c.scale(devicePixelRatio, devicePixelRatio); // Scales the drawing context so that drawing commands correspond to CSS pixels

// Center of the canvas
const x = canvas.width / 2;
const y = canvas.height / 2;

const backgroundImage = new Image();
backgroundImage.src = "../assets/background.png";

// ------------------------------
// Minimap canvas and context
// ------------------------------
const miniMap = document.querySelector("#miniMapC");
const miniMapCtx = miniMap.getContext("2d");
miniMap.width = 150;
miniMap.height = 150;

// ------------------------------
// Big Leaderboard Page
// ------------------------------
const rowPerPage = 10;
let globalPlayersArray = [];
let currentPage = 1;
let numberOfPage = 1;

// ------------------------------
// Possible Random Player Names
// ------------------------------
const playerNames = [
  "Shadow",
  "Raven",
  "Phoenix",
  "Blaze",
  "Viper",
  "Maverick",
  "Rogue",
  "Hunter",
  "Nova",
  "Zephyr",
  "Falcon",
  "Titan",
  "Specter",
  "Cyclone",
  "Inferno",
  "Reaper",
  "Stalker",
  "Venom",
  "Glitch",
  "Banshee",
  "Shadowstrike",
  "Onyx",
  "Rebel",
  "Fury",
  "Apex",
  "Crimson",
  "Nightfall",
  "Saber",
  "Tempest",
  "Lightning",
  "Bullet",
  "Vortex",
  "Echo",
  "Blitz",
  "Rift",
  "BOB",
];

// ------------------------------
// Data Structures for Game Objects
// ------------------------------
const frontEndPlayers = {}; // Object to keep track of all player objects on the client
const frontEndProjectiles = {}; // Object to keep track of all projectile objects on the client
let frontEndWeapons = {}; // Object to keep track of all weapons objects on the client
let frontEndPowerUps = {}; // Object to track power-ups on the client

// ------------------------------
// FPS ticker
// ------------------------------

let lastTime = performance.now();
let frames = 0;
let fps = 0;

/**
 * ------------------------------
 * Handling Server Updates for Projectiles
 * ------------------------------
 */
/**
 * Keeps the front end (client-side) projectiles in sync with the back end (server).
 * When the server emits 'updateProjectiles', iterate over each projectile and
 * create or update them locally.
 */
socket.on("updateProjectiles", (backEndProjectiles) => {
  // Loop over each projectile from the server (each has a unique id)
  for (const id in backEndProjectiles) {
    const backEndProjectile = backEndProjectiles[id];

    /**
     * If a projectile with this id doesn't exist on the client,
     * create a new Projectile object using the server's data.
     */
    if (!frontEndProjectiles[id]) {
      frontEndProjectiles[id] = new Projectile({
        x: backEndProjectile.x,
        y: backEndProjectile.y,
        radius: 5,
        color: frontEndPlayers[backEndProjectile.playerId]?.color, // Checks if client Player with server projectiles id exists and assigns color if it does
        velocity: backEndProjectile.velocity,
      });
    } else {
      // Update the client projectile’s position based on the server’s velocity
      frontEndProjectiles[id].x += backEndProjectiles[id].velocity.x;
      frontEndProjectiles[id].y += backEndProjectiles[id].velocity.y;
    }
  }

  /**
   * Remove any client-side projectiles that are no longer present on the server.
   */
  for (const frontEndProjectileId in frontEndProjectiles) {
    if (!backEndProjectiles[frontEndProjectileId]) {
      delete frontEndProjectiles[frontEndProjectileId];
    }
  }
});

//------------------------------
// Handling Server Updates for Players
// ------------------------------
/**
 * Keeps the front end (client side) players in sync with the back end (server).
 * When the server emits 'updatePlayers', update or create player objects as needed.
 */
socket.on("updatePlayers", (backEndPlayers) => {
  for (const id in backEndPlayers) {
    // displays the same info as if using socket.id, might want to remove the for loop
    const backEndPlayer = backEndPlayers[id];

    /**
     * If a player with this id does not exist on the client,
     * create a new Player object using the server's data.
     */

    if (!frontEndPlayers[id]) {
      frontEndPlayers[id] = new Player({
        x: backEndPlayer.x,
        y: backEndPlayer.y,
        radius: backEndPlayer.radius,
        color: backEndPlayer.color,
        username: backEndPlayer.username,
        health: backEndPlayer.health,
        speed: backEndPlayer.speed,
        score: backEndPlayer.score,
      });
    } else {
      frontEndPlayer = frontEndPlayers[id];
      // Updates the player equipped weapon in the front end
      frontEndPlayer.equippedWeapon = backEndPlayer.equippedWeapon;

      // Updates whether the player can shoot in the front end
      frontEndPlayer.canShoot = backEndPlayer.canShoot;

      // Updates about the punching
      frontEndPlayer.aimAngle = backEndPlayer.aimAngle;
      frontEndPlayer.handXMove = backEndPlayer.handX; // TEST
      frontEndPlayer.canPunch = backEndPlayer.canPunch;

      // Update player health in the frontend
      frontEndPlayer.health = backEndPlayer.health;

      // Update player score in the frontend
      frontEndPlayer.score = backEndPlayer.score;
      // Used for interpolation (moving the player closer to its new position)
      frontEndPlayer.target = {
        x: backEndPlayer.x,
        y: backEndPlayer.y,
      };

      if (id === socket.id) {
        const lastBackendInputIndex = playerInputs.findIndex((input) => {
          return backEndPlayer.sequenceNumber === input.sequenceNumber;
        });
        if (lastBackendInputIndex > -1) {
          playerInputs.splice(0, lastBackendInputIndex + 1);
        }
        playerInputs.forEach((input) => {
          frontEndPlayer.target.x += input.dx;
          frontEndPlayer.target.y += input.dy;
        });
      }
    }
  }

  // Remove any client-side players that no longer exist on the server
  for (const id in frontEndPlayers) {
    if (!backEndPlayers[id]) {
      const divToDelete = document.querySelector(`div[data-id="${id}"]`);
      //divToDelete.parentNode.removeChild(divToDelete);

      // If the local player has been removed, show the username form again
      if (id === socket.id) {
        document.querySelector("#usernameForm").style.display = "block";
      }
      delete frontEndPlayers[id];
    }
  }
});

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
function updateLeaderboardPage(players) {
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
    const rowColor = isLocalPlayer ? `style="color: ${entry.color};"` : "";
    document.querySelector("#player-labels").innerHTML += `
          <tr>
            <td ${rowColor}>${rankDisplay + startIndex}</td>
            <td>${entry.username}</td>
            <td data-id="${entry.id}score">${entry.score}</td>
            <td data-id="${entry.id}class">${entry.class}</td>
          </tr>`;
  });

  // Update the number of page in the big leaderboard
  document.getElementById("page-number").textContent = `${currentPage} / ${
    numberOfPage || 1
  }`;
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

// ------------------------------
// Leaderboard End
// ------------------------------

socket.on("removePowerUp", (powerUp) => {
  delete frontEndPowerUps[powerUp.id]; // Remove from frontend state
});

socket.on("updatePowerUps", (backEndPowerUps, powerUpData) => {
  if (powerUpData.remove) {
    // If the power-up was collected, remove it
    delete frontEndPowerUps[powerUpData.id];
  } else {
    if (!frontEndPowerUps[powerUpData.id]) {
      // Create the power-up if it doesn't exist
      frontEndPowerUps[powerUpData.id] = new PowerUpDrawing(powerUpData); // Stores the power-up data
    }
  }
});

socket.on("powerupCollected", (powerupData) => {
  const player = frontEndPlayers[socket.id];
  if (!player) return;

  // Apply powerup effect for visual feedback
  player.applyPowerup(powerupData.type, powerupData.duration);
});

socket.on("updatePowerUpsOnJoin", (backEndPowerUps) => {
  frontEndPowerUps = {};
  backEndPowerUps.forEach((powerUp) => {
    frontEndPowerUps[powerUp.id] = new PowerUps(powerUp);
  });
});

// ------------------------------
// Animation Loop (Game Rendering)
// ------------------------------
/**
 * Continuously updates the game state:
 * 1) Clears the canvas
 * 2) Moves players toward their target positions via interpolation
 * 3) Draws all players and projectiles
 */
let animationId;
function animate() {
  animationId = requestAnimationFrame(animate); // Tells the browser we want to perform an animation
  // c.fillStyle = 'rgba(0, 0, 0, 0.1)' // Optional "ghosting" effect if needed
  c.clearRect(0, 0, canvas.width, canvas.height); // Clears the entire canvas

  const now = performance.now();
  frames++;
  if (now - lastTime >= 1000) {
    fps = frames;
    frames = 0;
    lastTime = now;

    document.querySelector("#fpsCounter").textContent = `FPS: ${fps}`;
  }

  const localPlayer = frontEndPlayers[socket.id];

  if (!localPlayer) return;

  let cameraX = 0,
    cameraY = 0;
  let pixelNumber = 2 * devicePixelRatio;

  cameraX = localPlayer.x - canvas.width / pixelNumber;
  cameraY = localPlayer.y - canvas.height / pixelNumber;

  c.save();
  c.translate(-cameraX, -cameraY);
  c.drawImage(backgroundImage, 0, 0, 5000, 5000);

  miniMapCtx.clearRect(0, 0, miniMap.width, miniMap.height);
  // Interpolate and draw each player
  for (const id in frontEndPlayers) {
    const frontEndPlayer = frontEndPlayers[id];

    drawOnMiniMap(frontEndPlayer);

    // linear interpolation (move the player closer to its target)
    if (frontEndPlayer.target) {
      frontEndPlayers[id].x +=
        (frontEndPlayers[id].target.x - frontEndPlayers[id].x) * 0.5;
      frontEndPlayers[id].y +=
        (frontEndPlayers[id].target.y - frontEndPlayers[id].y) * 0.5;
    }
    frontEndPlayer.draw({
      xPosition: frontEndPlayer.handXMove,
      angle: frontEndPlayer.aimAngle,
    });
  }

  for (const weapon in frontEndWeapons) {
    const frontEndWeapon = frontEndWeapons[weapon];
    frontEndWeapon.draw();
    drawOnMiniMap(frontEndWeapon);
  }

  // Draw the PowerUps
  for (const powerUp in frontEndPowerUps) {
    const frontEndPowerUp = frontEndPowerUps[powerUp];
    frontEndPowerUp.draw();
    drawOnMiniMap(frontEndPowerUp);
  }

  // Draw each projectile
  for (const id in frontEndProjectiles) {
    const frontEndProjectile = frontEndProjectiles[id];
    frontEndProjectile.draw();
  }

  c.restore();
}

animate();

// ------------------------------
// Player Input Handling
// ------------------------------
/**
 * Tracks which movement keys (W, A, S, D) are currently pressed.
 * This object is used to generate movement inputs.
 */
const keys = {
  w: { pressed: false },
  a: { pressed: false },
  s: { pressed: false },
  d: { pressed: false },
  q: { pressed: false },
  f: { pressed: false },
  tab: { pressed: false },
  num1: { pressed: false },
  num2: { pressed: false },
};

/**
 * We keep a local buffer (playerInputs) of all unacknowledged inputs.
 * The server eventually sends back a sequenceNumber acknowledging the last
 * processed input, and we remove old inputs from this list.
 */
const playerInputs = [];
let sequenceNumber = 0;

/**
 * Every 15 milliseconds, check which keys are pressed.
 * If a key is pressed, record the input and send it to the server.
 */
setInterval(() => {
  // Ensure the local player exists before trying to move
  const player = frontEndPlayers[socket.id];
  if (!player) return;

  // Dynamically get the player's speed
  const SPEED = 5 * player.speed;

  /**
   * Player movement
   */

  if (keys.w.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: 0, dy: -SPEED });
    socket.emit("keydown", { keycode: "KeyW", sequenceNumber });
  }

  if (keys.a.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: -SPEED, dy: 0 });
    socket.emit("keydown", { keycode: "KeyA", sequenceNumber });
  }

  if (keys.s.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: 0, dy: SPEED });
    socket.emit("keydown", { keycode: "KeyS", sequenceNumber });
  }

  if (keys.d.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: SPEED, dy: 0 });
    socket.emit("keydown", { keycode: "KeyD", sequenceNumber });
  }

  /**
   * Interact with Weapons
   */

  if (keys.q.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: 0, dy: 0 });
    socket.emit("weaponDrop", { keycode: "KeyD", sequenceNumber });
  }

  if (keys.f.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: 0, dy: 0 });
    socket.emit("pickUpWeapon", { keycode: "KeyF", sequenceNumber });
  }

  /**
   * Inventory
   */
  if (keys.num1.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: 0, dy: 0 });
    document.querySelector("#inventorySlot1").style.borderColor = "blue"; // Highlights the first Inventory Slot
    socket.emit("weaponSelected", { keycode: "Digit1", sequenceNumber }); // Emits the information back to the server
  } else {
    if (!keys.num1.pressed && keys.num2.pressed) {
      document.querySelector("#inventorySlot1").style.borderColor = "white"; // Turns the inventory back to original color
    }
  }

  if (keys.num2.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: 0, dy: 0 });
    document.querySelector("#inventorySlot2").style.borderColor = "blue"; // Highlights the second Inventory Slot
    socket.emit("weaponSelected", { keycode: "Digit2", sequenceNumber }); // Emits the information back to the server
  } else {
    if (keys.num1.pressed && !keys.num2.pressed) {
      document.querySelector("#inventorySlot2").style.borderColor = "white"; // Turns the inventory back to original color
    }
  }
}, 15); // (default: 15)

// ------------------------------
// Event Listeners for Key Presses
// ------------------------------
/**
 * Listen for keydown events and mark the corresponding key as pressed.
 * This allows for continuous movement while the key is held.
 */
window.addEventListener("keydown", (event) => {
  // If the local player's data is not yet available, ignore input events
  if (!frontEndPlayers[socket.id]) return;

  if ((event.code === "Digit1" || event.code === "Digit2") && event.repeat)
    return;

  switch (event.code) {
    case "KeyW":
      keys.w.pressed = true;
      break;
    case "KeyA":
      keys.a.pressed = true;
      break;
    case "KeyS":
      keys.s.pressed = true;
      break;
    case "KeyD":
      keys.d.pressed = true;
      break;
    case "KeyQ":
      keys.q.pressed = true;
      break;
    case "KeyF":
      keys.f.pressed = true;
      break;
    case "Tab":
      keys.tab.pressed = true;
      break;
    case "Digit1":
      keys.num1.pressed = true;
      break;
    case "Digit2":
      keys.num2.pressed = true;
      break;
  }
});

/**
 * Listen for keyup events and mark the corresponding key as no longer pressed.
 */
window.addEventListener("keyup", (event) => {
  if (!frontEndPlayers[socket.id]) return;

  switch (event.code) {
    case "KeyW":
      keys.w.pressed = false;
      break;
    case "KeyA":
      keys.a.pressed = false;
      break;
    case "KeyS":
      keys.s.pressed = false;
      break;
    case "KeyD":
      keys.d.pressed = false;
      break;
    case "KeyQ":
      keys.q.pressed = false;
      break;
    case "KeyF":
      keys.f.pressed = false;
      break;
    case "Tab":
      keys.tab.pressed = false;
      // console.log("Tab up")
      break;
    case "Digit1":
      keys.num1.pressed = false;
      break;
    case "Digit2":
      keys.num2.pressed = false;
      break;
  }
});

// ------------------------------
// Mini Map
// ------------------------------
function drawOnMiniMap(item, worldWidth = 5000, worldHeight = 5000) {
  const minimapScaleX = miniMap.width / worldWidth;
  const minimapScaleY = miniMap.height / worldHeight;

  const miniX = item.x * minimapScaleX;
  const miniY = item.y * minimapScaleY;

  if (item instanceof Player) {
    if (item === frontEndPlayers[socket.id]) {
      miniMapCtx.beginPath();
      miniMapCtx.arc(miniX, miniY, 4, 0, Math.PI * 2);
      miniMapCtx.strokeStyle = "white";
      miniMapCtx.lineWidth = 1;
      miniMapCtx.stroke();
      miniMapCtx.closePath();
    }

    miniMapCtx.beginPath();
    miniMapCtx.arc(miniX, miniY, 2, 0, Math.PI * 2);
    miniMapCtx.fillStyle = item.color;
    miniMapCtx.fill();
    miniMapCtx.closePath();
  } else if (item instanceof WeaponDrawing) {
    miniMapCtx.beginPath();
    miniMapCtx.rect(miniX, miniY, 4, 4);
    miniMapCtx.fillStyle = "yellow";
    miniMapCtx.fill();
    miniMapCtx.closePath();
  } else if (item instanceof PowerUpDrawing) {
    miniMapCtx.beginPath();
    miniMapCtx.moveTo(miniX, miniY - 4);
    miniMapCtx.lineTo(miniX - 4, miniY);
    miniMapCtx.lineTo(miniX + 4, miniY);
    miniMapCtx.fillStyle = "green";
    miniMapCtx.fill();
    miniMapCtx.closePath();
  }
}

// ------------------------------
// Class Selection Handling
// ------------------------------
const classSelectors = ["Tank", "Rogue", "Mage", "Gunner"]; // Possible classes
let classSelection = 0; // Starts in Tank
let className = classSelectors[classSelection]; // Selects the class

/**
 * Cycles forward in the array
 * @returns the selected class
 */
function nextClass() {
  classSelection = (classSelection + 1) % classSelectors.length;
  return classSelectors[classSelection];
}

/**
 * Cycles Backwards in the array
 * @returns the selected class
 */
function previousClass() {
  classSelection =
    (classSelection - 1 + classSelectors.length) % classSelectors.length;
  return classSelectors[classSelection];
}

document.querySelector("#showClass").textContent = "Class: " + className; // Displays the first class

// When the user clicks the -> arrow it goes to the next class
document.querySelector("#classSelectorRight").addEventListener("click", () => {
  className = nextClass();
  document.querySelector("#showClass").textContent = "Class: " + className;
});

// When the user clicks the <- arrow it goes to the previous class
document.querySelector("#classSelectorLeft").addEventListener("click", () => {
  className = previousClass();
  document.querySelector("#showClass").textContent = "Class: " + className;
});

// ------------------------------
// Random Username Handling
// ------------------------------
/**
 * Generate a random name that isn't already in use by another player on the client.
 * If the generated name is taken, recurse until a unique name is found.
 */
function selectName() {
  let playerNameNumber = Math.floor(Math.random() * playerNames.length);
  let name = playerNames[playerNameNumber];
  for (const id in frontEndPlayers) {
    if (frontEndPlayers[id].username === name) {
      // If name is already taken by a current player, try again
      return selectName();
    }
  }
  return name;
}

let playerName = selectName();
document.querySelector("#selectedRandomName").textContent = playerName;

document.querySelector("#randomNameBtn").addEventListener("click", () => {
  // Generate a new random name when clicked
  playerName = selectName();
  document.querySelector("#selectedRandomName").textContent = playerName;
});

// ------------------------------
// Username Form Handling
// ------------------------------
/**
 * When the player submits their username (or chosen random name):
 * - Prevent default form submission
 * - Hide the username form
 * - Emit an 'initGame' event to the server with our chosen data
 */
document.querySelector("#usernameForm").addEventListener("submit", (event) => {
  event.preventDefault(); // Prevents the form from refreshing
  document.querySelector("#usernameForm").style.display = "none"; // Hides the username form
  document.querySelector("#inventoryArea").style.display = "flex";
  // Send data to the server to initialize the player
  socket.emit("initGame", {
    width: canvas.width,
    height: canvas.height,
    devicePixelRatio,
    username: playerName,
    className,
  });
});

// ------------------------------
// Leader Board Show Handler
// ------------------------------
document.addEventListener("keydown", function (event) {
  if (event.key === "Tab") {
    event.preventDefault(); // Prevent default tab behavior
    document.querySelector(".leaderboard").style.display = "block";
  }
});

document.addEventListener("keyup", function (event) {
  if (event.key === "Tab") {
    document.querySelector(".leaderboard").style.display = "none";
  }
});

// ------------------------------
// Kill Feed Handler
// ------------------------------
socket.on("updateKillFeed", ({ killerName, victimName, weapon }) => {
  const msg = document.createElement("div");
  msg.classList.add("kill-message");
  msg.innerHTML = `<strong style="color: green;">${killerName}</strong> used <strong>${weapon}<strong> kill <strong style="color: red;">${victimName}</strong>`;
  killFeed.prepend(msg); // newest messages at top

  // Automatically remove after animation completes
  setTimeout(() => {
    msg.remove();
  }, 4000); // same duration as animation
});
