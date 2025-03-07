// ------------------------------
// Canvas and Context Setup
// ------------------------------
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d"); // Using "c" as in your Main branch

// ------------------------------
// Socket.IO and DOM Element Setup
// ------------------------------
const socket = io();
const scoreEl = document.querySelector("#scoreEl"); // If you want to use #scoreEl for scoreboard text

// ------------------------------
// Device Pixel Ratio and Canvas Dimensions
// ------------------------------
const devicePixelRatio = window.devicePixelRatio || 1;
const GAME_WIDTH = 1024; // from either branch
const GAME_HEIGHT = 576; // from either branch

canvas.width = GAME_WIDTH * devicePixelRatio;
canvas.height = GAME_HEIGHT * devicePixelRatio;
c.scale(devicePixelRatio, devicePixelRatio);

// ------------------------------
// Center of the Canvas (if you need it)
const x = canvas.width / 2;
const y = canvas.height / 2;

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
const frontEndPlayers = {}; // Keep track of players
const frontEndProjectiles = {}; // Keep track of projectiles
let frontEndWeapons = {}; // Keep track of weapons

// ------------------------------
// Handling Projectiles from the Server
// ------------------------------
socket.on("updateProjectiles", (backEndProjectiles) => {
  // Sync / create
  for (const id in backEndProjectiles) {
    const backEndProjectile = backEndProjectiles[id];
    if (!frontEndProjectiles[id]) {
      frontEndProjectiles[id] = new Projectile({
        x: backEndProjectile.x,
        y: backEndProjectile.y,
        radius: 5,
        color: frontEndPlayers[backEndProjectile.playerId]?.color,
        velocity: backEndProjectile.velocity,
      });
    } else {
      // Update position
      frontEndProjectiles[id].x += backEndProjectiles[id].velocity.x;
      frontEndProjectiles[id].y += backEndProjectiles[id].velocity.y;
    }
  }

  // Remove projectiles that no longer exist on server
  for (const frontEndProjectileId in frontEndProjectiles) {
    if (!backEndProjectiles[frontEndProjectileId]) {
      delete frontEndProjectiles[frontEndProjectileId];
    }
  }
});

// ------------------------------
// Handling Players from the Server
// ------------------------------
socket.on("updatePlayers", (backEndPlayers) => {
  for (const id in backEndPlayers) {
    const backEndPlayer = backEndPlayers[id];

    // If this player doesn't exist on the client, create it
    if (!frontEndPlayers[id]) {
      frontEndPlayers[id] = new Player({
        x: backEndPlayer.x,
        y: backEndPlayer.y,
        radius: backEndPlayer.radius || 10,
        color: backEndPlayer.color,
        username: backEndPlayer.username,
        health: backEndPlayer.health,
        speed: backEndPlayer.speed,
      });

      // Add new player to the small/hud leaderboard
      document.querySelector(
        "#playerLabels"
      ).innerHTML += `<div data-id="${id}" data-score="${backEndPlayer.score}">
           ${backEndPlayer.username}: ${backEndPlayer.score}
         </div>`;
    } else {
      // Player already exists: update its stats
      frontEndPlayers[id].health = backEndPlayer.health;

      // Update scoreboard
      document.querySelector(
        `div[data-id="${id}"]`
      ).innerHTML = `${backEndPlayer.username}: ${backEndPlayer.score}`;
      document
        .querySelector(`div[data-id="${id}"]`)
        .setAttribute("data-score", backEndPlayer.score);

      // Sort scoreboard descending
      const parentDiv = document.querySelector("#playerLabels");
      const childDivs = Array.from(parentDiv.querySelectorAll("div"));
      childDivs.sort((a, b) => {
        const scoreA = Number(a.getAttribute("data-score"));
        const scoreB = Number(b.getAttribute("data-score"));
        return scoreB - scoreA; // descending
      });
      childDivs.forEach((div) => parentDiv.removeChild(div));
      childDivs.forEach((div) => parentDiv.appendChild(div));

      // Interpolation target
      frontEndPlayers[id].target = {
        x: backEndPlayer.x,
        y: backEndPlayer.y,
      };

      // If this is *our* player, reapply any unprocessed inputs
      if (id === socket.id) {
        const lastBackendInputIndex = playerInputs.findIndex(
          (input) => backEndPlayer.sequenceNumber === input.sequenceNumber
        );
        if (lastBackendInputIndex > -1) {
          playerInputs.splice(0, lastBackendInputIndex + 1);
        }
        playerInputs.forEach((input) => {
          frontEndPlayers[id].target.x += input.dx;
          frontEndPlayers[id].target.y += input.dy;
        });
      }
    }
  }

  // Remove any client players that no longer exist server-side
  for (const id in frontEndPlayers) {
    if (!backEndPlayers[id]) {
      const divToDelete = document.querySelector(`div[data-id="${id}"]`);
      if (divToDelete?.parentNode) {
        divToDelete.parentNode.removeChild(divToDelete);
      }
      // If our local player was removed, show the name form again
      if (id === socket.id) {
        document.querySelector("#usernameForm").style.display = "block";
      }
      delete frontEndPlayers[id];
    }
  }
});

// ------------------------------
// Handling Weapons from the Server
// (Only in the Main branch file)
// ------------------------------
socket.on("updateWeapons", (backEndWeapons, weaponData) => {
  // A weapon got removed on the server
  if (weaponData.remove) {
    delete frontEndWeapons[weaponData.id];
  } else {
    // Or it was created
    if (!frontEndWeapons[weaponData.id]) {
      frontEndWeapons[weaponData.id] = new WeaponDrawing(weaponData);
    }
  }
});

// When a player joins, the server sends them all existing weapons
socket.on("updateWeaponsOnJoin", (backEndWeapons) => {
  frontEndWeapons = {};
  backEndWeapons.forEach((weapon) => {
    frontEndWeapons[weapon.id] = new WeaponDrawing(weapon);
  });
});

// The server told us a player equipped a weapon
socket.on("equipWeapon", (weaponEquipped, player) => {
  // Check inventory slots in DOM
  if (player.inventory[0] && !player.inventory[1]) {
    // Show in slot1
    document.querySelector("#inventorySlot1Text").textContent =
      weaponEquipped.name;
  } else {
    // If second slot is open
    if (player.inventory[1]) {
      document.querySelector("#inventorySlot2Text").textContent =
        weaponEquipped.name;
    }
  }
});

// ------------------------------
// Animation Loop
// ------------------------------
let animationId;
function animate() {
  animationId = requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height);

  // Interpolate + draw players
  for (const id in frontEndPlayers) {
    const p = frontEndPlayers[id];
    if (p.target) {
      p.x += (p.target.x - p.x) * 0.5;
      p.y += (p.target.y - p.y) * 0.5;
    }
    p.draw();
  }

  // Draw any weapons
  for (const w in frontEndWeapons) {
    frontEndWeapons[w].draw();
  }

  // Draw projectiles
  for (const id in frontEndProjectiles) {
    frontEndProjectiles[id].draw();
  }
}
animate();

// ------------------------------
// Movement Input Handling
// ------------------------------
const keys = {
  w: { pressed: false },
  a: { pressed: false },
  s: { pressed: false },
  d: { pressed: false },
  num1: { pressed: false },
  num2: { pressed: false },
  // If you want Tab logic in here, you can also add it
};

const playerInputs = [];
let sequenceNumber = 0;

setInterval(() => {
  // Make sure local player exists
  const player = frontEndPlayers[socket.id];
  if (!player) return;

  // Combine base speed (5) with server-based class speed
  const SPEED = 5 * (player.speed || 1);

  // Movement
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

  // Weapon slots
  if (keys.num1.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: 0, dy: 0 });
    document.querySelector("#inventorySlot1").style.borderColor = "blue";
    socket.emit("weaponSelected", { keycode: "Digit1", sequenceNumber });
  } else {
    // revert slot1 color if needed
    if (!keys.num1.pressed) {
      document.querySelector("#inventorySlot1").style.borderColor = "white";
    }
  }
  if (keys.num2.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: 0, dy: 0 });
    document.querySelector("#inventorySlot2").style.borderColor = "blue";
    socket.emit("weaponSelected", { keycode: "Digit2", sequenceNumber });
  } else {
    // revert slot2 color if needed
    if (!keys.num2.pressed) {
      document.querySelector("#inventorySlot2").style.borderColor = "white";
    }
  }
}, 15);

// ------------------------------
// Key Press/Release Listeners
// ------------------------------
window.addEventListener("keydown", (event) => {
  if (!frontEndPlayers[socket.id]) return;

  // Prevent repeated Digit1 or Digit2 spams if you like
  if ((event.code === "Digit1" || event.code === "Digit2") && event.repeat) {
    return;
  }

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
    case "Digit1":
      keys.num1.pressed = true;
      break;
    case "Digit2":
      keys.num2.pressed = true;
      break;
    // If using Tab to show big scoreboard
    case "Tab":
      event.preventDefault(); // so it doesn’t jump focus
      document.querySelector(".leaderboard").style.display = "block";
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
    case "Digit1":
      keys.num1.pressed = false;
      break;
    case "Digit2":
      keys.num2.pressed = false;
      break;
    case "Tab":
      document.querySelector(".leaderboard").style.display = "none";
      break;
  }
});

// ------------------------------
// Class Selection Handling
// ------------------------------
const classSelectors = ["Tank", "Rogue", "Mage", "Gunner"];
let classSelection = 0; // start with Tank (index 0)
let className = classSelectors[classSelection];

function nextClass() {
  classSelection = (classSelection + 1) % classSelectors.length;
  return classSelectors[classSelection];
}
function previousClass() {
  classSelection =
    (classSelection - 1 + classSelectors.length) % classSelectors.length;
  return classSelectors[classSelection];
}

document.querySelector("#showClass").textContent = "Class: " + className;

// Next Class Button
document.querySelector("#classSelectorRight").addEventListener("click", () => {
  className = nextClass();
  document.querySelector("#showClass").textContent = "Class: " + className;
});

// Previous Class Button
document.querySelector("#classSelectorLeft").addEventListener("click", () => {
  className = previousClass();
  document.querySelector("#showClass").textContent = "Class: " + className;
});

// ------------------------------
// Random Name Handling
// ------------------------------
function selectName() {
  let randIndex = Math.floor(Math.random() * playerNames.length);
  let tryName = playerNames[randIndex];
  // Make sure no current player has it
  for (const id in frontEndPlayers) {
    if (frontEndPlayers[id].username === tryName) {
      return selectName(); // keep trying
    }
  }
  return tryName;
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

  // Let the server know we want to spawn in with certain settings
  socket.emit("initGame", {
    width: canvas.width,
    height: canvas.height,
    devicePixelRatio,
    username: playerName, // from our random selection
    className,
  });
});
