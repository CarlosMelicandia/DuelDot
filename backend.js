// ------------------------------
// Module Imports and Server Setup
// ------------------------------
const express = require("express");
const app = express();

// Importing different player classes
const Tank = require("./Tank.js");
const Mage = require("./Mage.js");
const Rogue = require("./Rogue.js");
const Gunner = require("./Gunner.js");
const {
  Weapon,
  Pistol,
  SubmachineGun,
  Sniper,
  Shuriken,
} = require("./WeaponStuff/Weapons.js");
const {
  spawnWeapons,
  checkCollision,
} = require("./WeaponStuff/BackWeaponLogic.js");

// ------------------------------
// Socket.IO Setup
// ------------------------------
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

/**
 * Creates a Socket.io server instance
 * - `pingInterval`: Interval (2 seconds) at which the server sends ping packets to the client.
 * - `pingTimeout`: Maximum time (5 seconds) the server waits for a pong response.
 */
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 });

const port = 3000; // Default port

// ------------------------------
// Express Middleware and Routes
// ------------------------------
app.use(express.static("public"));

// When a player visits the root URL, serve index.html
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// ------------------------------
// Server-side Data Structures
// ------------------------------
const backEndPlayers = {}; // Holds all players by socket.id
const backEndProjectiles = {}; // Holds projectiles keyed by a unique ID
const backEndWeapons = []; // Holds any spawned weapons

// Canvas default dimensions
const GAME_WIDTH = 1024;
const GAME_HEIGHT = 576;

// Projectile info
const PROJECTILE_RADIUS = 5;
let projectileId = 0; // Unique ID for each projectile

// ------------------------------
// Socket.IO Connection and Event Handlers
// ------------------------------
io.on("connection", (socket) => {
  console.log("A user connected.");

  // Send the current list of players to the newly connected client
  io.emit("updatePlayers", backEndPlayers);

  /**
   * Listen for 'shoot' event to create a new projectile.
   */
  socket.on("shoot", ({ x, y, angle }) => {
    projectileId++;
    const velocity = {
      x: Math.cos(angle) * 5,
      y: Math.sin(angle) * 5,
    };

    // Create a new server-side projectile
    backEndProjectiles[projectileId] = {
      x,
      y,
      velocity,
      playerId: socket.id,
    };
  });

  /**
   * Listen for 'initGame' to create a new player instance.
   */
  socket.on("initGame", ({ username, width, height, className }) => {
    // Decide random spawn position
    let x = GAME_WIDTH * Math.random();
    let y = GAME_HEIGHT * Math.random();

    // Class mapping
    const Classes = {
      Tank: Tank,
      Mage: Mage,
      Rogue: Rogue,
      Gunner: Gunner,
    };

    // Instantiate the appropriate class
    const newPlayer = new Classes[className]({
      username: username,
      x: x,
      y: y,
      score: 0,
      sequenceNumber: 0,
    });

    // Store the player
    backEndPlayers[socket.id] = newPlayer;
    newPlayer.socketId = socket.id;

    // Store player's canvas dimensions
    backEndPlayers[socket.id].canvas = {
      width,
      height,
    };

    console.log(
      `Class: ${backEndPlayers[socket.id].constructor.name}, 
       Health: ${backEndPlayers[socket.id].health}, 
       Radius: ${backEndPlayers[socket.id].radius}, 
       Speed: ${backEndPlayers[socket.id].speed}`
    );

    // When a player joins, tell them about existing weapons
    socket.emit("updateWeaponsOnJoin", backEndWeapons);
  });

  /**
   * Handle weapon selection (inventory slots).
   */
  socket.on("weaponSelected", ({ keycode, sequenceNumber }) => {
    const backEndPlayer = backEndPlayers[socket.id];
    if (!backEndPlayer) return;

    backEndPlayer.sequenceNumber = sequenceNumber;
    switch (keycode) {
      case "Digit1":
        backEndPlayer.equippedWeapon = backEndPlayer.inventory[0];
        break;
      case "Digit2":
        backEndPlayer.equippedWeapon = backEndPlayer.inventory[1];
        break;
      default:
        break;
    }
  });

  /**
   * Handle movement via keydown.
   */
  socket.on("keydown", ({ keycode, sequenceNumber }) => {
    const backEndPlayer = backEndPlayers[socket.id];
    if (!backEndPlayer) return;

    backEndPlayer.sequenceNumber = sequenceNumber;

    // Move the player based on class speed
    // (We multiply 5 * their speed so each class can differ in rate)
    switch (keycode) {
      case "KeyW":
        backEndPlayer.y -= 5 * backEndPlayer.speed;
        break;
      case "KeyA":
        backEndPlayer.x -= 5 * backEndPlayer.speed;
        break;
      case "KeyS":
        backEndPlayer.y += 5 * backEndPlayer.speed;
        break;
      case "KeyD":
        backEndPlayer.x += 5 * backEndPlayer.speed;
        break;
    }

    // Keep the player in-bounds
    const playerSides = {
      left: backEndPlayer.x - backEndPlayer.radius,
      right: backEndPlayer.x + backEndPlayer.radius,
      top: backEndPlayer.y - backEndPlayer.radius,
      bottom: backEndPlayer.y + backEndPlayer.radius,
    };

    if (playerSides.left < 0) backEndPlayer.x = backEndPlayer.radius;
    if (playerSides.right > GAME_WIDTH)
      backEndPlayer.x = GAME_WIDTH - backEndPlayer.radius;
    if (playerSides.top < 0) backEndPlayer.y = backEndPlayer.radius;
    if (playerSides.bottom > GAME_HEIGHT)
      backEndPlayer.y = GAME_HEIGHT - backEndPlayer.radius;
  });

  /**
   * Handle player disconnect.
   */
  socket.on("disconnect", (reason) => {
    console.log(`User disconnected: ${reason}`);
    delete backEndPlayers[socket.id];
    io.emit("updatePlayers", backEndPlayers);
  });
});

// Spawn weapons at intervals (from second snippet)
spawnWeapons(backEndWeapons, io);

// ------------------------------
// Backend Ticker (Game Loop)
// ------------------------------
setInterval(() => {
  // Check if players collide with weapons
  for (const playerId in backEndPlayers) {
    const player = backEndPlayers[playerId];
    checkCollision(backEndWeapons, io, player);
  }

  // Update projectile positions
  for (const id in backEndProjectiles) {
    const proj = backEndProjectiles[id];
    proj.x += proj.velocity.x;
    proj.y += proj.velocity.y;

    // Remove projectiles out of bounds
    if (
      proj.x - PROJECTILE_RADIUS >= GAME_WIDTH ||
      proj.x + PROJECTILE_RADIUS <= 0 ||
      proj.y - PROJECTILE_RADIUS >= GAME_HEIGHT ||
      proj.y + PROJECTILE_RADIUS <= 0
    ) {
      delete backEndProjectiles[id];
      continue;
    }

    // Detect collisions with players
    for (const playerId in backEndPlayers) {
      const backEndPlayer = backEndPlayers[playerId];
      const dist = Math.hypot(
        proj.x - backEndPlayer.x,
        proj.y - backEndPlayer.y
      );

      // If a collision occurred, and it wasn't the shooter hitting themself
      if (
        dist < PROJECTILE_RADIUS + backEndPlayer.radius &&
        proj.playerId !== playerId
      ) {
        // Find the shooter
        const shooter = backEndPlayers[proj.playerId];

        if (shooter && shooter.equippedWeapon) {
          // Calculate total damage based on the shooter’s weapon damage & any multiplier
          const dmg =
            shooter.equippedWeapon.damage * (shooter.lightWpnMtp || 1);
          backEndPlayer.health -= dmg;
        } else {
          console.log(`Shooter or their equipped weapon is undefined.`);
        }

        // If health drops below or equal to 0, remove the player
        if (backEndPlayer.health <= 0) {
          // Award shooter a score if they exist
          if (shooter) {
            shooter.score++;
          }
          delete backEndPlayers[playerId];
        }

        // Remove the projectile after the hit
        delete backEndProjectiles[id];
        break;
      }
    }
  }

  // Notify all clients of updated data
  io.emit("updateProjectiles", backEndProjectiles);
  io.emit("updatePlayers", backEndPlayers);
}, 15);

// ------------------------------
// Start the Server
// ------------------------------
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

console.log("Server did load");
