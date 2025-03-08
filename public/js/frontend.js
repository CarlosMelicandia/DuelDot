// ------------------------------
// Canvas and Context Setup
// ------------------------------
const canvas = document.querySelector("canvas"); // Finds the canvas element from the HTML file
const ctx = canvas.getContext("2d"); // Context in which the canvas is being made

// ------------------------------
// Socket.IO and DOM Element Setup
// ------------------------------
const socket = io(); // This is what allows for communication to happen between the client and the server and vice versa

const scoreEl = document.querySelector("#scoreEl"); // Finds the element with id "scoreEL" from html file

// ------------------------------
// Device Pixel Ratio and Canvas Dimensions
// ------------------------------
const devicePixelRatio = window.devicePixelRatio || 1; // Gets the device's pixel ratio (for high-DPI displays), defaulting to 1 if unavailable

// Assigns the canvas height and width to variables
const GAME_WIDTH = 1024; // (default 1024)
const GAME_HEIGHT = 576; // (default 576)

// Sets the canvas’s internal width and height
// Adjusts te canvas width and height to ensure proper resolution on multiple devices
canvas.width = GAME_WIDTH * devicePixelRatio;
canvas.height = GAME_HEIGHT * devicePixelRatio;

ctx.scale(devicePixelRatio, devicePixelRatio); // Scales the drawing context so that drawing commands correspond to CSS pixels (ensuring a 1:1 ratio)

// Center of the canvas
const x = canvas.width / 2;
const y = canvas.height / 2;

/**
 * ------------------------------
 * Data Structures for Game Objects
 * ------------------------------
 */
const frontEndPlayers = {}; // Object to keep track of all player objects on the client
const frontEndProjectiles = {}; // Object to keep track of all projectile objects on the client

/**
 * ------------------------------
 * Handling Server Updates for Projectiles
 * ------------------------------
 */
/**
 * Keeps the front end (client-side) projectiles in sync with the back end (server).
 * When the server emits 'updateProjectiles', iterate over each projectile.
 */
socket.on("updateProjectiles", (backEndProjectiles) => {
  // Waits until the server emits an "updateProjectiles" event
  for (const id in backEndProjectiles) {
    // Loop over each projectile from the server (each has a unique id)
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
      // Updates the client projectiles position based on the velocity of the server's projectile
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

// ------------------------------
// Handling Server Updates for Players
// ------------------------------
/**
 * Keeps the front end (client side) players in sync with the back end (server).
 * When the server emits 'updatePlayers', update or create player objects as needed.
 */
socket.on("updatePlayers", (backEndPlayers) => {
  // Waits until the server emits an "updatePlayers" event
  for (const id in backEndPlayers) {
    // Loop over each player received from the server
    const backEndPlayer = backEndPlayers[id]; // Assigns backEndPlayer to each player's ID

    /**
     * If a player with this id does not exist on the client,
     * create a new Player object using the server's data.
     */
    if (!frontEndPlayers[id]) {
      frontEndPlayers[id] = new Player({
        x: backEndPlayer.x,
        y: backEndPlayer.y,
        radius: 10,
        color: backEndPlayer.color,
        username: backEndPlayer.username,
      });

      // Adds that player with their attributes to the leaderboard
      document.querySelector(
        "#playerLabels"
      ).innerHTML += `<div data-id="${id}" data-score="${backEndPlayer.score}">${backEndPlayer.username}: ${backEndPlayer.score}</div>`;
    } else {
    /**
     * If the player exists in both client and server side it will
     * display and reorder the list so that the players are shown in
     * descending order
     */
      // Updates the username of the player in the leaderboard to display their new score
      document.querySelector(
        `div[data-id="${id}"]`
      ).innerHTML = `${backEndPlayer.username}: ${backEndPlayer.score}`;

      // document.getElementById(id).style.color = color // breaks everything :(
      //Ties player name and score to their color
      document.querySelector(`div[data-id="${id}"]`).style.color =
        backEndPlayer.color;

      document
        .querySelector(`div[data-id="${id}"]`) // Selects a DOM element that matches the player's id
        .setAttribute("data-score", backEndPlayer.score); // Updates the label in HTML to show the players latest score from the server

      // Sort the leaderboard entries so that players with higher scores appear first
      const parentDiv = document.querySelector("#playerLabels"); // Assigns parentDiv to an html element with ID playerLabels
      const childDivs = Array.from(parentDiv.querySelectorAll("div")); // Assigns a copy of an Array of all players with their username and score so we can sort them

      // compares two elements a and b, which are the players scores and puts the higher one first
      childDivs.sort((a, b) => {
        const scoreA = Number(a.getAttribute("data-score"));
        const scoreB = Number(b.getAttribute("data-score"));

        return scoreB - scoreA; // Descending order: higher scores first
      });

      // Remove the old leaderboard entries
      childDivs.forEach((div) => {
        parentDiv.removeChild(div);
      });

      // Re-adds them in sorted order
      childDivs.forEach((div) => {
        parentDiv.appendChild(div);
      });

      // Used for interpolation (get new values from existing ones) to match client's player position to server side
      frontEndPlayers[id].target = {
        x: backEndPlayer.x,
        y: backEndPlayer.y,
      };

      // Checks if the player id matches clients id to run code specifically for that player
      if (id === socket.id) {
        const lastBackendInputIndex = playerInputs.findIndex((input) => {
          // Gets the last input from the server of that player
          return backEndPlayer.sequenceNumber === input.sequenceNumber;
        });

        // Removes all inputs from playerInputs up to and including that index
        if (lastBackendInputIndex > -1)
          playerInputs.splice(0, lastBackendInputIndex + 1);

        // This ensures that the player's position on both the the client and the server stay in sync
        playerInputs.forEach((input) => {
          frontEndPlayers[id].target.x += input.dx;
          frontEndPlayers[id].target.y += input.dy;
        });
      }
    }
  }

  // Removes any client side players that no longer exists in backEndPLayers (server side)
  for (const id in frontEndPlayers) {
    if (!backEndPlayers[id]) {
      const divToDelete = document.querySelector(`div[data-id="${id}"]`);
      divToDelete.parentNode.removeChild(divToDelete);

      // If the local player has been removed, show the username form again
      if (id === socket.id) {
        document.querySelector("#usernameForm").style.display = "block";
      }

      delete frontEndPlayers[id];
    }
  }
});

// ------------------------------
// Animation Loop (Game Rendering)
// ------------------------------
/**
 * Continuously updates the game state:
 * - Clears the canvas
 * - Moves players toward their target positions via interpolation
 * - Draws all players and projectiles
 */
let animationId;
function animate() {
  animationId = requestAnimationFrame(animate); // Tells the browser you want to do an animation
  // ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clears the canvas

  for (const id in frontEndPlayers) {
    // For ever player in the frontEndPLayers array
    const frontEndPlayer = frontEndPlayers[id]; // Assigns a specific player to frontEndPlayer

    // linear interpolation (moving the player closer to the target)
    // First checks to see if the client player has x and y and then proceeds to move the player halfway every frame
    if (frontEndPlayer.target) {
      // .target is an object containing the x and y coordinates of a player (client side)
      frontEndPlayers[id].x +=
        (frontEndPlayers[id].target.x - frontEndPlayers[id].x) * 0.5;
      frontEndPlayers[id].y +=
        (frontEndPlayers[id].target.y - frontEndPlayers[id].y) * 0.5;
    }

    frontEndPlayer.draw();
  }

  // Loops through each client side projectile in frontEndProjectiles and calls the draw method
  for (const id in frontEndProjectiles) {
    const frontEndProjectile = frontEndProjectiles[id];
    frontEndProjectile.draw();
  }

  // (Optional commented-out code for updating projectiles if needed)
  // for (let i = frontEndProjectiles.length - 1; i >= 0; i--) {
  //   const frontEndProjectile = frontEndProjectiles[i]
  //   frontEndProjectile.update()
  // }
}

animate(); // Calls the animate function

// ------------------------------
// Player Input Handling (Movement)
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
  tab: { pressed: false },
};

const SPEED = 5; // How fast the player moves per tick
const playerInputs = []; // Stores the local inputs of a player
let sequenceNumber = 0; // Counts the number of movement inputs sent to the server
/**
 * Every 15 milliseconds, check which keys are pressed.
 * If a key is pressed, record the input and send it to the server.
 */
setInterval(() => {
  if (keys.w.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: 0, dy: -SPEED }); // Adds the playersInput info to the playerInputs Array
    socket.emit("keydown", { keycode: "KeyW", sequenceNumber }); // Sends the information to the server
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
}, 15); // (Default: 15)

// ------------------------------
// Event Listeners for Key Presses
// ------------------------------
/**
 * Listen for keydown events and mark the corresponding key as pressed.
 * This helps in tracking continuous movement.
 */
window.addEventListener("keydown", (event) => {
  // If the local player's data is not yet available, ignore input events
  if (!frontEndPlayers[socket.id]) return;

  switch (event.code) {
    case "KeyW":
      keys.w.pressed = true;
      // console.log("W down") //testing
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
      // console.log("Tab down")
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
    case "Tab":
      keys.tab.pressed = false;
      // console.log("Tab up")
      break;
  }
});

// ------------------------------
// Username Form Handling
// ------------------------------
/**
 * When the player submits their username:
 * - Prevent the default form submission (which would reload the page)
 * - Hide the username form
 * - Emit an "initGame" event to the server with canvas settings and the username,
 *   so the server can initialize and track the new player.
 */
document.querySelector("#usernameForm").addEventListener("submit", (event) => {
  event.preventDefault(); // Prevents the form from refreshing the page on submission
  document.querySelector("#usernameForm").style.display = "none"; // Hides the username form
  // Sends initGame which tells the server to track this player with their settings
  socket.emit("initGame", {
    width: canvas.width,
    height: canvas.height,
    devicePixelRatio,
    username: document.querySelector("#usernameInput").value,
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
