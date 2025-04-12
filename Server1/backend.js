// ------------------------------
// Module Imports and Server Setup
// ------------------------------
const express = require("express"); // Imports the express module
const app = express(); // Creates an instance of an Express application

// Importing different player classes
const Tank = require("./UserClasses/Tank.js");
const Mage = require("./UserClasses/Mage.js");
const Rogue = require("./UserClasses/Rogue.js");
const Gunner = require("./UserClasses/Gunner.js");
const { Fist } = require("./WeaponStuff/Weapons.js");
const { spawnWeapons, checkCollision, weaponDrop } = require("./WeaponStuff/BackWeaponLogic.js");
const { updateLeaderBoard } = require("./backendLeaderBoard.js")
const { spawnPowerUps, checkPowerUpCollision } = require('./PowerUps/BackPowerUpLogic.js')
const { playerMovement } = require("./Player/PlayerMovement.js")
const { playerPunch, playerShoot, playerProjectile } = require("./Player/PlayerCombat.js")

// ------------------------------
// Socket.IO Setup
// ------------------------------
const http = require("http"); // Import Node's built-in HTTP module
const server = http.createServer(app); // Create an HTTP server using the Express app
const { Server } = require("socket.io"); // Import the Socket.IO Server class
const { PowerUp } = require('./PowerUps/BackPowerUps.js')

/**
 * Creates a Socket.io server instance
 * - `pingInterval`: Interval (2 seconds) at which the server sends ping packets to the client.
 * - `pingTimeout`: Maximum time (5 seconds) the server waits for a pong response before considering the client disconnected.
 */
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 });

const port = 3000; // Default port in which the server runs as LocalHost

// ------------------------------
// Express Middleware and Routes
// ------------------------------
app.use(express.static("public")); // Any files placed in the public folder become accessible to clients via HTTP requests

// When a player visits the root URL (e.g., http://localhost:3000/), they receive the index.html file
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html"); //_dirname is this file's absolute path
});

// ------------------------------
// Server-side Data Structures
// ------------------------------
const backEndPlayers = {} // List of player object objects server-side
const backEndProjectiles = {} // List of projectile objects server-side
const backEndWeapons = [] // List of weapon references server-side
const backEndPowerUps = [] // List of power-ups references server-side
const usedNames = [] // List of all used names

// Assigns the canvas height and width to variables
const GAME_WIDTH = 5000; // Default width
const GAME_HEIGHT = 5000; // Default height

const projectileRadius = 5 // Radius of projectiles

const fist = new Fist() // initiates the fist

// ------------------------------
// Socket.IO Connection and Event Handlers
// ------------------------------
io.on("connection", (socket) => {
  //  io.on listens for an event that is sent to the server via .emit()
  console.log("A user connected"); // Logs that a player has connected

  io.emit("updatePlayers", backEndPlayers); // Send the current list of players to all connected clients

  /**
   * Listens for an 'initGame' event from the client to create a new player.
   */
  socket.on("initGame", ({ username, width, height, className }) => {
    let x = GAME_WIDTH * Math.random();
    let y = GAME_HEIGHT * Math.random();

    // Object storing the different player class constructors
    const Classes = {
      Tank: Tank,
      Mage: Mage,
      Rogue: Rogue,
      Gunner: Gunner,
    };

    // Create a new player object of the selected class
    const newPlayer = new Classes[className]({
      username: username,
      x: x,
      y: y,
      equippedWeapon: fist,
      score: 0,
      sequenceNumber: 0
    })
    
    newPlayer.isPlaying = true
    backEndPlayers[socket.id] = newPlayer
    newPlayer.socketId = socket.id // Adds the player ID to their player profile

    // Store the canvas settings for the player
    backEndPlayers[socket.id].canvas = {
      width,
      height
    }
    
    console.log(`Class: ${backEndPlayers[socket.id].constructor.name}, Health: ${backEndPlayers[socket.id].health}, Radius: ${backEndPlayers[socket.id].radius}, Speed: ${backEndPlayers[socket.id].speed}, Weapon: ${backEndPlayers[socket.id].equippedWeapon.name}`)
    
    io.emit("updatePlayers", backEndPlayers); // Send an updated player list to all clients
    updateLeaderBoard(backEndPlayers, io); // Update the leaderboard when a new player join
    socket.emit("updateWeaponsOnJoin", backEndWeapons); // Send the current list of weapons to the new player
    socket.emit("updatePowerUpsOnJoin", backEndPowerUps)
  })

  /**
   * Handles player disconnection.
   */
  socket.on("disconnect", (reason) => {
    console.log(reason); // Logs why the player disconnected
    delete backEndPlayers[socket.id]; // Remove the player from the server's list
    io.emit("updatePlayers", backEndPlayers); // Send an updated player list to all clients
    updateLeaderBoard(backEndPlayers, io); // Update the leaderboard when a player disconnects
  });

  /**
   * Handles weapon selection
   */
  socket.on("weaponSelected", ({ keycode, sequenceNumber }) => {
    const backEndPlayer = backEndPlayers[socket.id];

    if (!backEndPlayer) return; // Checks if the player exists in the server

    backEndPlayer.sequenceNumber = sequenceNumber; // Updates their sequenceNumber

    switch (keycode) {
      case "Digit1":
        if (backEndPlayer.inventory[0]){
          backEndPlayer.equippedWeapon = backEndPlayer.inventory[0] // adds the weapon to their first slot in inventory
          console.log(backEndPlayer.inventory[0])
        } else if (backEndPlayer.equippedWeapon.name != "Fist"){ // Goes back to fist if inventory slot is empty
          backEndPlayer.equippedWeapon = fist
        }
        break
      case "Digit2":       
       if (backEndPlayer.inventory[1]){
          backEndPlayer.equippedWeapon = backEndPlayer.inventory[1] // adds the weapon to their second slot in inventory
        } else if (backEndPlayer.equippedWeapon.name != "Fist"){ // Goes back to fist if inventory slot is empty
          backEndPlayer.equippedWeapon = fist
        }
        break
    }
  })

  socket.on('weaponDrop', ({keycode, sequenceNumber}) => {
    const backEndPlayer = backEndPlayers[socket.id]

    if (!backEndPlayer.equippedWeapon || backEndPlayer.equippedWeapon.name == "fist"|| !backEndPlayer) return

    backEndPlayer.sequenceNumber = sequenceNumber
    const droppedWeapon = backEndPlayer.equippedWeapon
    console.log("Dropped:", droppedWeapon) // TEST
    
    const slotIndex = backEndPlayer.inventory.findIndex(slot => slot === droppedWeapon)
    
    if (slotIndex !== -1) {
      backEndPlayer.inventory[slotIndex] = null // Set the slot to null instead of removing
    }

    backEndPlayer.equippedWeapon = fist    

    weaponDrop(droppedWeapon, backEndPlayer.x, backEndPlayer.y, io, backEndWeapons)
    socket.emit('removeWeapon', backEndPlayer)
  })

  socket.on('pickUpWeapon', ({keycode, sequenceNumber}) => {
    const backEndPlayer = backEndPlayers[socket.id]

    if (!backEndPlayer) return

    backEndPlayer.sequenceNumber = sequenceNumber
    checkCollision(backEndWeapons, io, backEndPlayer) // Weapon collision
  })

  /**
   * When client emits a ping check event, it sends the signal back
   */
  socket.on("pingCheck", () => {
    socket.emit("pongCheck");
  });

  socket.on('updateHands', (angle) => {
    const backEndPlayer = backEndPlayers[socket.id]

    if (!backEndPlayer) return

    backEndPlayer.aimAngle = angle
  })  
  
  playerPunch(socket, backEndPlayers)
  playerShoot(socket, backEndPlayers, backEndProjectiles)
  playerMovement(socket, backEndPlayers, GAME_WIDTH, GAME_HEIGHT)
})

spawnWeapons(backEndWeapons, io, backEndPlayers); // Function to spawn weapons
spawnPowerUps(backEndPowerUps, io, backEndPlayers); // Function to spawn power-ups


// ------------------------------
// Backend Ticker (Game Loop)
// ------------------------------
setInterval(() => { 
  for (const playerId in backEndPlayers){
    const player = backEndPlayers[playerId]
    checkPowerUpCollision(backEndPowerUps, io, player, backEndPlayers) // Power-up collision
  }

  playerProjectile(backEndProjectiles, backEndPlayers, io, GAME_WIDTH, GAME_HEIGHT, projectileRadius)

  io.emit('updatePowerUps', backEndPowerUps, {remove: false})
  io.emit("updatePlayers", backEndPlayers) // Send an updated list of players to all clients
}, 15);

// ------------------------------
// Start the Server
// ------------------------------
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

console.log("Server did load");
