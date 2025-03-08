// ------------------------------
// Canvas and Context Setup
// ------------------------------
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// ------------------------------
// Socket.IO and DOM Element Setup
// ------------------------------
const socket = io();
const scoreEl = document.querySelector("#scoreEl");

// ------------------------------
// Device Pixel Ratio and Canvas Dimensions
// ------------------------------
const devicePixelRatio = window.devicePixelRatio || 1;
const GAME_WIDTH = 1024;
const GAME_HEIGHT = 576;

canvas.width = GAME_WIDTH * devicePixelRatio;
canvas.height = GAME_HEIGHT * devicePixelRatio;
ctx.scale(devicePixelRatio, devicePixelRatio);

// Center of the canvas
const x = canvas.width / 2;
const y = canvas.height / 2;

// ------------------------------
// Possible Random Player Names
// ------------------------------
const playerNames = [
  "Shadow", "Raven", "Phoenix", "Blaze", "Viper", "Maverick", "Rogue",
  "Hunter", "Nova", "Zephyr", "Falcon", "Titan", "Specter", "Cyclone",
  "Inferno", "Reaper", "Stalker", "Venom", "Glitch", "Banshee", "Shadowstrike",
  "Onyx", "Rebel", "Fury", "Apex", "Crimson", "Nightfall", "Saber", "Tempest",
  "Lightning", "Bullet", "Vortex", "Echo", "Blitz", "Rift", "BOB"
];

// ------------------------------
// Data Structures for Game Objects
// ------------------------------
const frontEndPlayers = {};
const frontEndProjectiles = {};
let frontEndWeapons = {};

// ------------------------------
// Handling Server Updates for Projectiles
// ------------------------------
socket.on("updateProjectiles", (backEndProjectiles) => {
  for (const id in backEndProjectiles) {
    const backEndProjectile = backEndProjectiles[id];
    if (!frontEndProjectiles[id]) {
      frontEndProjectiles[id] = new Projectile({
        x: backEndProjectile.x,
        y: backEndProjectile.y,
        radius: 5,
        color: frontEndPlayers[backEndProjectile.playerId]?.color,
        velocity: backEndProjectile.velocity
      });
    } else {
      frontEndProjectiles[id].x += backEndProjectiles[id].velocity.x;
      frontEndProjectiles[id].y += backEndProjectiles[id].velocity.y;
    }
  }
  for (const frontEndProjectileId in frontEndProjectiles) {
    if (!backEndProjectiles[frontEndProjectileId]) {
      delete frontEndProjectiles[frontEndProjectileId];
    }
  }
});

// ------------------------------
// Handling Server Updates for Players
// ------------------------------
socket.on("updatePlayers", (backEndPlayers) => {
  for (const id in backEndPlayers) {
    const backEndPlayer = backEndPlayers[id];
    if (!frontEndPlayers[id]) {
      frontEndPlayers[id] = new Player({
        x: backEndPlayer.x,
        y: backEndPlayer.y,
        radius: backEndPlayer.radius || 10,
        color: backEndPlayer.color,
        username: backEndPlayer.username,
        score: backEndPlayer.score,
        health: backEndPlayer.health,
        speed: backEndPlayer.speed
      });
      // Add new player to leaderboard
      document.querySelector("#playerLabels").innerHTML +=
        `<div data-id="${id}" data-score="${backEndPlayer.score}" data-username="${backEndPlayer.username}">
           ${backEndPlayer.username}: ${backEndPlayer.score}
         </div>`;
    } else {
      let playerDiv = document.querySelector(`div[data-id="${id}"]`);
      if (playerDiv) {
        playerDiv.innerHTML = `${backEndPlayer.username}: ${backEndPlayer.score}`;
        playerDiv.style.color = backEndPlayer.color;
        playerDiv.setAttribute("data-score", backEndPlayer.score);
      }
      frontEndPlayers[id].target = { x: backEndPlayer.x, y: backEndPlayer.y };
      frontEndPlayers[id].score = backEndPlayer.score;
      frontEndPlayers[id].color = backEndPlayer.color;
      frontEndPlayers[id].username = backEndPlayer.username;
      frontEndPlayers[id].health = backEndPlayer.health;
      frontEndPlayers[id].speed = backEndPlayer.speed;

      if (id === socket.id) {
        const lastBackendInputIndex = playerInputs.findIndex(input =>
          backEndPlayer.sequenceNumber === input.sequenceNumber
        );
        if (lastBackendInputIndex > -1)
          playerInputs.splice(0, lastBackendInputIndex + 1);
        playerInputs.forEach((input) => {
          frontEndPlayers[id].target.x += input.dx;
          frontEndPlayers[id].target.y += input.dy;
        });
      }
    }
  }
  // Remove players no longer on the server
  for (const id in frontEndPlayers) {
    if (!backEndPlayers[id]) {
      const divToDelete = document.querySelector(`div[data-id="${id}"]`);
      if (divToDelete && divToDelete.parentNode) {
        divToDelete.parentNode.removeChild(divToDelete);
      }
      if (id === socket.id) {
        document.querySelector("#usernameForm").style.display = "block";
      }
      delete frontEndPlayers[id];
    }
  }
  updateLeaderboardDisplay();
});

// ------------------------------
// Handling Weapon Updates (if any)
// ------------------------------
socket.on("updateWeapons", (backEndWeapons, weaponData) => {
  if (weaponData.remove) {
    delete frontEndWeapons[weaponData.id];
  } else {
    if (!frontEndWeapons[weaponData.id]) {
      frontEndWeapons[weaponData.id] = new WeaponDrawing(weaponData);
    }
  }
});

socket.on("updateWeaponsOnJoin", (backEndWeapons) => {
  frontEndWeapons = {};
  backEndWeapons.forEach((weapon) => {
    frontEndWeapons[weapon.id] = new WeaponDrawing(weapon);
  });
});

socket.on("equipWeapon", (weaponEquipped, player) => {
  if (player.inventory[0] && !player.inventory[1]) {
    document.querySelector("#inventorySlot1Text").textContent = weaponEquipped.name;
  } else if (player.inventory[1]) {
    document.querySelector("#inventorySlot2Text").textContent = weaponEquipped.name;
  }
});

// ------------------------------
// Update Leaderboard Display Function
// ------------------------------
function updateLeaderboardDisplay() {
  let playersArray = Object.entries(frontEndPlayers).map(([id, player]) => ({
    id,
    username: player.username,
    score: player.score,
    color: player.color
  }));
  playersArray.sort((a, b) => b.score - a.score);
  const localPlayerId = socket.id;
  let topPlayers = playersArray.slice(0, 10);
  const localPlayerInTop = topPlayers.find(p => p.id === localPlayerId);
  if (!localPlayerInTop) {
    const localPlayerData = playersArray.find(p => p.id === localPlayerId);
    if (localPlayerData) {
      localPlayerData.notRanked = true;
      topPlayers.push(localPlayerData);
    }
  }
  const parentDiv = document.querySelector("#playerLabels");
  parentDiv.innerHTML = "";
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
}

// ------------------------------
// Animation Loop (Game Rendering)
// ------------------------------
let animationId;
function animate() {
  animationId = requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const id in frontEndPlayers) {
    const frontEndPlayer = frontEndPlayers[id];
    if (frontEndPlayer.target) {
      frontEndPlayers[id].x += (frontEndPlayer.target.x - frontEndPlayers[id].x) * 0.5;
      frontEndPlayers[id].y += (frontEndPlayer.target.y - frontEndPlayers[id].y) * 0.5;
    }
    frontEndPlayer.draw();
  }
  for (const id in frontEndProjectiles) {
    const frontEndProjectile = frontEndProjectiles[id];
    frontEndProjectile.draw();
  }
  for (const weapon in frontEndWeapons) {
    frontEndWeapons[weapon].draw();
  }
}
animate();

// ------------------------------
// Player Input Handling (Movement & Inventory)
// ------------------------------
const keys = {
  w: { pressed: false },
  a: { pressed: false },
  s: { pressed: false },
  d: { pressed: false },
  tab: { pressed: false },
  num1: { pressed: false },
  num2: { pressed: false }
};
const SPEED = 5;
const playerInputs = [];
let sequenceNumber = 0;
setInterval(() => {
  const player = frontEndPlayers[socket.id];
  if (!player) return;
  const moveSpeed = SPEED * player.speed;
  if (keys.w.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: 0, dy: -moveSpeed });
    socket.emit("keydown", { keycode: "KeyW", sequenceNumber });
  }
  if (keys.a.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: -moveSpeed, dy: 0 });
    socket.emit("keydown", { keycode: "KeyA", sequenceNumber });
  }
  if (keys.s.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: 0, dy: moveSpeed });
    socket.emit("keydown", { keycode: "KeyS", sequenceNumber });
  }
  if (keys.d.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: moveSpeed, dy: 0 });
    socket.emit("keydown", { keycode: "KeyD", sequenceNumber });
  }
  if (keys.num1.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: 0, dy: 0 });
    document.querySelector("#inventorySlot1").style.borderColor = "blue";
    socket.emit("weaponSelected", { keycode: "Digit1", sequenceNumber });
  } else {
    document.querySelector("#inventorySlot1").style.borderColor = "white";
  }
  if (keys.num2.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: 0, dy: 0 });
    document.querySelector("#inventorySlot2").style.borderColor = "blue";
    socket.emit("weaponSelected", { keycode: "Digit2", sequenceNumber });
  } else {
    document.querySelector("#inventorySlot2").style.borderColor = "white";
  }
}, 15);

// ------------------------------
// Event Listeners for Key Presses
// ------------------------------
window.addEventListener("keydown", (event) => {
  if (!frontEndPlayers[socket.id]) return;
  if ((event.code === "Digit1" || event.code === "Digit2") && event.repeat) return;
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
    case "Tab":
      keys.tab.pressed = true;
      document.querySelector(".leaderboard").style.display = "block";
      break;
    case "Digit1":
      keys.num1.pressed = true;
      break;
    case "Digit2":
      keys.num2.pressed = true;
      break;
  }
});
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
    case "Tab":
      keys.tab.pressed = false;
      document.querySelector(".leaderboard").style.display = "none";
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
// Class Selection and Random Name Handling
// ------------------------------
const classSelectors = ["Tank", "Rogue", "Mage", "Gunner"];
let classSelection = 0;
let className = classSelectors[classSelection];
document.querySelector("#showClass").textContent = "Class: " + className;
document.querySelector("#classSelectorRight").addEventListener("click", () => {
  classSelection = (classSelection + 1) % classSelectors.length;
  className = classSelectors[classSelection];
  document.querySelector("#showClass").textContent = "Class: " + className;
});
document.querySelector("#classSelectorLeft").addEventListener("click", () => {
  classSelection = (classSelection - 1 + classSelectors.length) % classSelectors.length;
  className = classSelectors[classSelection];
  document.querySelector("#showClass").textContent = "Class: " + className;
});
function selectName() {
  let playerNameNumber = Math.floor(Math.random() * playerNames.length);
  let name = playerNames[playerNameNumber];
  for (const id in frontEndPlayers) {
    if (frontEndPlayers[id].username === name) {
      return selectName();
    }
  }
  return name;
}
let playerName = selectName();
document.querySelector("#selectedRandomName").textContent = playerName;
document.querySelector("#randomNameBtn").addEventListener("click", () => {
  playerName = selectName();
  document.querySelector("#selectedRandomName").textContent = playerName;
});

// ------------------------------
// Username Form Handling
// ------------------------------
document.querySelector("#usernameForm").addEventListener("submit", (event) => {
  event.preventDefault();
  document.querySelector("#usernameForm").style.display = "none";
  socket.emit("initGame", {
    width: canvas.width,
    height: canvas.height,
    devicePixelRatio,
    username: playerName,
    className
  });
});
