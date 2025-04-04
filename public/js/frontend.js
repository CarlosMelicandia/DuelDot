
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
// Possible Random Player Names
// ------------------------------
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
// Data Structures for Game Objects
// ------------------------------
const frontEndPlayers = {} // Object to keep track of all player objects on the client
const frontEndProjectiles = {} // Object to keep track of all projectile objects on the client
let frontEndWeapons = {} // Object to keep track of all weapons objects on the client
let frontEndPowerUps = {} // Object to track power-ups on the client

// ------------------------------
// FPS ticker & Ping
// ------------------------------ 

let lastTime = performance.now()
let frames = 0
let fps = 0

let lastPingTime = 0;
let ping = 0;


//------------------------------
// Handling Server Updates for Players
// ------------------------------
/**
 * Keeps the front end (client side) players in sync with the back end (server).
 * When the server emits 'updatePlayers', update or create player objects as needed.
 */
socket.on('updatePlayers', (backEndPlayers) => {
  for (const id in backEndPlayers) { // displays the same info as if using socket.id, might want to remove the for loop
    const backEndPlayer = backEndPlayers[id]

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
      })
    } else {
      frontEndPlayer = frontEndPlayers[id]
      // Updates the player equipped weapon in the front end
      frontEndPlayer.equippedWeapon = backEndPlayer.equippedWeapon

      // Updates whether the player can shoot in the front end
      frontEndPlayer.canShoot = backEndPlayer.canShoot

      // Updates about the punching
      frontEndPlayer.aimAngle = backEndPlayer.aimAngle
      frontEndPlayer.handXMove = backEndPlayer.handX // TEST
      frontEndPlayer.canPunch = backEndPlayer.canPunch

      // Update player health in the frontend
      frontEndPlayer.health = backEndPlayer.health

      // Used for interpolation (moving the player closer to its new position)
      frontEndPlayer.target = {
        x: backEndPlayer.x,
        y: backEndPlayer.y
      }

      if (id === socket.id) {
        const lastBackendInputIndex = playerInputs.findIndex((input) => {
          return backEndPlayer.sequenceNumber === input.sequenceNumber;
        });
        if (lastBackendInputIndex > -1) {
          playerInputs.splice(0, lastBackendInputIndex + 1);
        }
        playerInputs.forEach((input) => {
          frontEndPlayer.target.x += input.dx
          frontEndPlayer.target.y += input.dy
        })
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
  animationId = requestAnimationFrame(animate); // Tells the browser we want to perform an animation
  // c.fillStyle = 'rgba(0, 0, 0, 0.1)' // Optional "ghosting" effect if needed
  c.clearRect(0, 0, canvas.width, canvas.height); // Clears the entire canvas

  const now = performance.now()
  frames++
  if (now - lastTime >= 1000) {
    fps = frames
    frames = 0
    lastTime = now

    document.querySelector('#fpsCounter').textContent = `FPS: ${fps}`
  }
  
  const localPlayer = frontEndPlayers[socket.id]

  if (!localPlayer) return

  let cameraX = 0,
    cameraY = 0;
  let pixelNumber = 2 * devicePixelRatio;
  
  cameraX = localPlayer.x - canvas.width / pixelNumber;
  cameraY = localPlayer.y - canvas.height / pixelNumber;

  c.save();
  c.translate(-cameraX, -cameraY);
  c.drawImage(backgroundImage, 0, 0, 5000, 5000);

  miniMapCtx.clearRect(0, 0, miniMap.width, miniMap.height)
  // Interpolate and draw each player
  for (const id in frontEndPlayers) {
    const frontEndPlayer = frontEndPlayers[id];

    drawOnMiniMap(frontEndPlayer)

    // linear interpolation (move the player closer to its target)
    if (frontEndPlayer.target) {
      frontEndPlayers[id].x +=
        (frontEndPlayers[id].target.x - frontEndPlayers[id].x) * 0.5;
      frontEndPlayers[id].y +=
        (frontEndPlayers[id].target.y - frontEndPlayers[id].y) * 0.5;
    }
    frontEndPlayer.draw({ xPosition: frontEndPlayer.handXMove, angle: frontEndPlayer.aimAngle })
  }

  for (const weapon in frontEndWeapons) {
    const frontEndWeapon = frontEndWeapons[weapon];
    frontEndWeapon.draw();
    drawOnMiniMap(frontEndWeapon)
  }

  //Draw the PowerUps
  for (const powerUp in frontEndPowerUps) {
    const frontEndPowerUp = frontEndPowerUps[powerUp];
    frontEndPowerUp.draw();
    drawOnMiniMap(frontEndPowerUp)
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
    playerInputs.push({ sequenceNumber, dx: SPEED, dy: 0 })
    socket.emit("keydown", { keycode: "KeyD", sequenceNumber })
  }

  /**
   * Interact with Weapons
   */

    if (keys.q.pressed){
      sequenceNumber++
      playerInputs.push({ sequenceNumber, dx: 0, dy: 0 })
      socket.emit('weaponDrop', { keycode: 'KeyD', sequenceNumber })
    }

    if (keys.f.pressed){
      sequenceNumber++
      playerInputs.push({ sequenceNumber, dx: 0, dy: 0 })
      socket.emit('pickUpWeapon', { keycode: 'KeyF', sequenceNumber })
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
document.querySelector('#usernameForm').addEventListener('submit', (event) => {
  event.preventDefault() // Prevents the form from refreshing
  document.querySelector('#usernameForm').style.display = 'none' // Hides the username form
  document.querySelector('#inventoryArea').style.display = 'flex'
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

