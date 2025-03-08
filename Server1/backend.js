// ------------------------------
// Module Imports and Server Setup
// ------------------------------
const express = require('express');
const app = express();

const Tank = require('./Tank.js');
const Mage = require('./Mage.js');
const Rogue = require('./Rogue.js');
const Gunner = require('./Gunner.js');
const { Weapon, Pistol, SubmachineGun, Sniper, Shuriken } = require('./WeaponStuff/Weapons.js');
const { spawnWeapons, checkCollision } = require('./WeaponStuff/BackWeaponLogic.js');

// ------------------------------
// Socket.IO Setup
// ------------------------------
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 });

const port = 3000;

// ------------------------------
// Express Middleware and Routes
// ------------------------------
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// ------------------------------
// Server-side Data Structures
// ------------------------------
const backEndPlayers = {};
const backEndProjectiles = {};
const backEndWeapons = []; // For weapon spawning

const GAME_WIDTH = 1024;
const GAME_HEIGHT = 576;
const SPEED = 5;
const RADIUS = 10;
const PROJECTILE_RADIUS = 5;
let projectileId = 0;

// ------------------------------
// Socket.IO Connection and Event Handlers
// ------------------------------
io.on('connection', (socket) => {
  console.log('A user connected');

  io.emit('updatePlayers', backEndPlayers);

  // When a client shoots, create a new projectile
  socket.on('shoot', ({ x, y, angle }) => {
    projectileId++;
    const velocity = {
      x: Math.cos(angle) * 5,
      y: Math.sin(angle) * 5
    };
    backEndProjectiles[projectileId] = {
      x,
      y,
      velocity,
      playerId: socket.id
    };
  });

  // When a client initializes the game, create a new player
  socket.on('initGame', ({ username, width, height, className }) => {
    let x = GAME_WIDTH * Math.random();
    let y = GAME_HEIGHT * Math.random();
    const Classes = { Tank, Mage, Rogue, Gunner };
    const newPlayer = new Classes[className]({
      username: username,
      x: x,
      y: y,
      score: 0,
      sequenceNumber: 0
    });
    backEndPlayers[socket.id] = newPlayer;
    newPlayer.socketId = socket.id;
    backEndPlayers[socket.id].canvas = { width, height };
    backEndPlayers[socket.id].radius = RADIUS;
    console.log(`New ${newPlayer.constructor.name}: Health ${newPlayer.health}, Radius ${newPlayer.radius}, Speed ${newPlayer.speed}`);
    socket.emit('updateWeaponsOnJoin', backEndWeapons);
  });

  // Handle player disconnection
  socket.on('disconnect', (reason) => {
    console.log(reason);
    delete backEndPlayers[socket.id];
    io.emit('updatePlayers', backEndPlayers);
  });

  // Handle weapon selection
  socket.on('weaponSelected', ({ keycode, sequenceNumber }) => {
    const player = backEndPlayers[socket.id];
    if (!player) return;
    player.sequenceNumber = sequenceNumber;
    if (keycode === "Digit1") {
      player.equippedWeapon = player.inventory[0];
    } else if (keycode === "Digit2") {
      player.equippedWeapon = player.inventory[1];
    }
  });

  // Handle movement keydown events
  socket.on('keydown', ({ keycode, sequenceNumber }) => {
    const player = backEndPlayers[socket.id];
    if (!player) return;
    player.sequenceNumber = sequenceNumber;
    switch (keycode) {
      case 'KeyW':
        player.y -= SPEED * player.speed;
        break;
      case 'KeyA':
        player.x -= SPEED * player.speed;
        break;
      case 'KeyS':
        player.y += SPEED * player.speed;
        break;
      case 'KeyD':
        player.x += SPEED * player.speed;
        break;
    }
    // Keep the player within bounds
    const sides = {
      left: player.x - player.radius,
      right: player.x + player.radius,
      top: player.y - player.radius,
      bottom: player.y + player.radius
    };
    if (sides.left < 0) player.x = player.radius;
    if (sides.right > GAME_WIDTH) player.x = GAME_WIDTH - player.radius;
    if (sides.top < 0) player.y = player.radius;
    if (sides.bottom > GAME_HEIGHT) player.y = GAME_HEIGHT - player.radius;
  });
});

// Spawn weapons on the map (custom function)
spawnWeapons(backEndWeapons, io);

// ------------------------------
// Backend Ticker (Game Loop)
// ------------------------------
setInterval(() => {
  // Update projectile positions
  for (const id in backEndProjectiles) {
    backEndProjectiles[id].x += backEndProjectiles[id].velocity.x;
    backEndProjectiles[id].y += backEndProjectiles[id].velocity.y;
    if (
      backEndProjectiles[id].x - PROJECTILE_RADIUS >= backEndPlayers[backEndProjectiles[id].playerId]?.canvas?.width ||
      backEndProjectiles[id].x + PROJECTILE_RADIUS <= 0 ||
      backEndProjectiles[id].y - PROJECTILE_RADIUS >= backEndPlayers[backEndProjectiles[id].playerId]?.canvas?.height ||
      backEndProjectiles[id].y + PROJECTILE_RADIUS <= 0
    ) {
      delete backEndProjectiles[id];
      continue;
    }
    // Check collisions with players
    for (const playerId in backEndPlayers) {
      const player = backEndPlayers[playerId];
      const DIST = Math.hypot(
        backEndProjectiles[id].x - player.x,
        backEndProjectiles[id].y - player.y
      );
      if (DIST < PROJECTILE_RADIUS + player.radius && backEndProjectiles[id].playerId !== playerId) {
        if (backEndPlayers[backEndProjectiles[id].playerId]) {
          backEndPlayers[backEndProjectiles[id].playerId].score++;
        }
        console.log(`Player ${backEndProjectiles[id].playerId} hit player ${playerId}`);
        delete backEndProjectiles[id];
        delete backEndPlayers[playerId];
        break;
      }
    }
  }
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
