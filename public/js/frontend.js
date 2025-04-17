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
const gameWidth = backgroundImage.width
const gameHeight = backgroundImage.height

// ------------------------------
// Big Leaderboard Page
// ------------------------------
const rowPerPage = 10;
let globalPlayersArray = [];
let currentPage = 1;
let numberOfPage = 1;


// ------------------------------
// Data Structures for Game Objects
// ------------------------------
const frontEndPlayers = {}; // Object to keep track of all player objects on the client
const frontEndProjectiles = {}; // Object to keep track of all projectile objects on the client
let frontEndWeapons = {}; // Object to keep track of all weapons objects on the client
let frontEndPowerUps = {}; // Object to track power-ups on the client

// ------------------------------
// FPS ticker & Ping
// ------------------------------
let lastTime = performance.now();
let frames = 0;
let fps = 0;

let lastPingTime = 0;
let ping = 0;

let gameStarted = false;

// ------------------------------
// Slot Inventory
// ------------------------------
// 1 means slot 1 is selected, 2 means slot 2 is selected, -1 means no slot is selected
let keyDownWeapon = -1; // Variable to track the key pressed for the weapon

//------------------------------
// Handling Server Updates for Players
// ------------------------------
/**
 * Keeps the front end (client side) players in sync with the back end (server).
 * When the server emits 'updatePlayers', update or create player objects as needed.
 */
socket.on("updatePlayers", (backEndPlayers) => {
  if (!gameStarted) return
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
      frontEndPlayer.equippedWeapon = backEndPlayer.equippedWeapon

      if (backEndPlayer.equippedWeapon.imagePath) {
        const weaponImg = new Image();
        weaponImg.src = backEndPlayer.equippedWeapon.imagePath;
        frontEndPlayer.equippedWeapon.image = weaponImg;
      }
      
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

socket.on("playerRespawn", (player) =>{
  // Show respawn form
  document.querySelector("#usernameForm").style.display = "block";
  
  const itemsToHide = document.querySelectorAll('.removeAfter')
  itemsToHide.forEach((item) => {
    item.style.display = 'flex' // Hides the whole menu
  })
  const itemsToShow = document.querySelectorAll('.displayAfter')
  itemsToShow.forEach((item) => {
    item.style.display = 'none'
  })

  gameStarted = false
})

// ------------------------------
// Ping Checker
// ------------------------------

// Send ping to server every 2 seconds
setInterval(() => {
  lastPingTime = performance.now() // Timestamp
  socket.emit("pingCheck")
}, 2000)

// Listen for pong from server
socket.on("pongCheck", () => {
  const now = performance.now()
  ping = Math.round(now - lastPingTime) // ping in ms

  // Update the ping display
  document.querySelector("#pingDisplay").textContent = `Ping: ${ping}ms`
})

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
  if (!gameStarted) return
  
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
  
  const frontEndPlayer = frontEndPlayers[socket.id]

  let cameraX = 0;
  let cameraY = 0;

  c.save();

  if (gameStarted && frontEndPlayer) {
    cameraX = frontEndPlayer.x - canvas.width / (2 * devicePixelRatio)
    cameraY = frontEndPlayer.y - canvas.height / (2 * devicePixelRatio)
  } 

  
  c.translate(-cameraX, -cameraY);
  c.drawImage(backgroundImage, 0, 0, 5000, 5000);
  if (gameStarted) miniMapCtx.clearRect(0, 0, miniMap.width, miniMap.height)
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
  e: { pressed: false },
  f: { pressed: false },
  tab: { pressed: false },
  num1: { pressed: false },
  num2: { pressed: false },
  num3: { pressed: false }
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
  if (!gameStarted && !player) return;

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

  if (keys.e.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: 0, dy: 0 });
    socket.emit("abilityActivated", { sequenceNumber });
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
  if (keys.num1.pressed && !keys.num2.pressed && keyDownWeapon < 0) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: 0, dy: 0 });
    document.querySelector("#inventorySlot1").style.borderColor = "blue"; // Highlights the first Inventory Slot
    socket.emit("weaponSelected", { keycode: "Digit1", sequenceNumber, keyDownWeapon}); // Emits the information back to the server
    keyDownWeapon = 1;
  }else if (!keys.num1.pressed && keyDownWeapon === 1){
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: 0, dy: 0 });
    document.querySelector("#inventorySlot1").style.borderColor = "white"; // Highlights the first Inventory Slot
    socket.emit("weaponSelected", { keycode: "Digit1", sequenceNumber, keyDownWeapon}); // Emits the information back to the server
    keyDownWeapon = -1;
  }

  if (keys.num2.pressed && !keys.num1.pressed && keyDownWeapon < 0) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: 0, dy: 0 });
    document.querySelector("#inventorySlot2").style.borderColor = "blue"; // Highlights the second Inventory Slot
    socket.emit("weaponSelected", { keycode: "Digit2", sequenceNumber, keyDownWeapon }); // Emits the information back to the server
    keyDownWeapon = 2;
  }else if (!keys.num2.pressed && keyDownWeapon === 2) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: 0, dy: 0 });
    document.querySelector("#inventorySlot2").style.borderColor = "white"; // Highlights the second Inventory Slot
    socket.emit("weaponSelected", { keycode: "Digit2", sequenceNumber, keyDownWeapon }); // Emits the information back to the server
    keyDownWeapon = -1;  
  }

  if (keys.num3.pressed && !keys.num1.pressed && !keys.num2.pressed && keyDownWeapon < 0) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: 0, dy: 0 });
    document.querySelector("#inventorySlot3").style.borderColor = "blue";
    socket.emit("weaponSelected", { keycode: "Digit3", sequenceNumber, keyDownWeapon });
    keyDownWeapon = 3;
  } else if (!keys.num3.pressed && keyDownWeapon === 3) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: 0, dy: 0 });
    document.querySelector("#inventorySlot3").style.borderColor = "white";
    socket.emit("weaponSelected", { keycode: "Digit3", sequenceNumber, keyDownWeapon });
    keyDownWeapon = -1;
  }
}, 15); // (default: 15)

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
socket.on("updateKillFeed", ({ victemId, killerId, killerName, victimName, weapon }) => {
  const msg = document.createElement("div");
  let image = "";
  msg.classList.add("kill-message");
  switch (weapon) {
    case "pistol":
      image = "./assets/weapons/FirePistol.png";
      break;
    case "submachineGun":
      image = "./assets/weapons/ShotGun.png";
      break;
    case "sniper":
      image = "./assets/weapons/Sniper.png";
      break;
    case "shuriken":
      image = "./assets/weapons/Shuriken.png";
      break;
  }

  if (socket.id === victemId || socket.id === killerId) {
    msg.innerHTML = `<span style="color: green;">${killerName}</span> <img src=${image} style="width: 30px; height: 30px;"> <span style="color: red;">${victimName}</span>`;
    killFeed.prepend(msg); // newest messages at top
  }else {
    msg.innerHTML = `${killerName} <img src=${image} style="width: 30px; height: 30px;"> ${victimName}`;
    killFeed.prepend(msg); // newest messages at top
  }

  // Automatically remove after animation completes
  setTimeout(() => {
    msg.remove();
  }, 5000); // same duration as animation
});
