// ------------------------------
// Module Imports and Server Setup
// ------------------------------
const express = require('express') // Imports the express module
const app = express() // Creates an instance of an Express application

// Importing different player classes
const Tank = require('./Tank.js')
const Mage = require('./Mage.js')
const Rogue = require('./Rogue.js')
const Gunner = require('./Gunner.js')
const { Weapon, Pistol, SubmachineGun, Sniper, Shuriken } = require('./WeaponStuff/Weapons.js')
const { spawnWeapons, checkCollision } = require('./WeaponStuff/BackWeaponLogic.js')

// ------------------------------
// Socket.IO Setup
// ------------------------------
const http = require('http') // Import Node's built-in HTTP module
const server = http.createServer(app) // Create an HTTP server using the Express app
const { Server } = require('socket.io')  // Import the Socket.IO Server class

/**
 * Creates a Socket.io server instance
 * - `pingInterval`: Interval (2 seconds) at which the server sends ping packets to the client.
 * - `pingTimeout`: Maximum time (5 seconds) the server waits for a pong response before considering the client disconnected.
 */
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 })

const port = 3000 // Default port in which the server runs as LocalHost

// ------------------------------
// Express Middleware and Routes
// ------------------------------
app.use(express.static('public')) // Any files placed in the public folder become accessible to clients via HTTP requests

// When a player visits the root URL (e.g., http://localhost:3000/), they receive the index.html file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html') //_dirname is this file's absolute path
})

// ------------------------------
// Server-side Data Structures
// ------------------------------
const backEndPlayers = {} // List of player object objects server-side
const backEndProjectiles = {} // List of projectile objects server-side
const backEndWeapons = [] // List of weapon references server-side

// Assigns the canvas height and width to variables
const GAME_WIDTH = 1024 // Default width
const GAME_HEIGHT = 576 // Default height

const PROJECTILE_RADIUS = 5 // Radius of projectiles
let projectileId = 0 // Unique ID counter for each projectile created


// ------------------------------
// Socket.IO Connection and Event Handlers
// ------------------------------
io.on('connection', (socket) => { //  io.on listens for an event that is sent to the server via .emit()
  console.log('A user connected') // Logs that a player has connected

  io.emit('updatePlayers', backEndPlayers) // Send the current list of players to all connected clients

  /**
   * When the client emits a 'shoot' event, a new projectile is created.
   */
  socket.on('shoot', ({ x, y, angle }) => { 
    if (backEndPlayers[socket.id].canShoot) { 
      projectileId++ // Increment the projectile ID

      // Calculate the velocity of the projectile based on the angle provided by the client----------------------------------------------------
      const velocity = {
        x: Math.cos(angle) * 5,  //Weapon Velocity 
        y: Math.sin(angle) * 5   // Weapon Velocity
      }

      // Create a new server-side projectile
      backEndProjectiles[projectileId] = {
        x,
        y,
        velocity,
        playerId: socket.id
      }

      // Delay Calculation 
      backEndPlayers[socket.id].canShoot = false
      setInterval(() => {
        backEndPlayers[socket.id].canShoot = true
      }, 5000)
    }
  })

  /**
   * Listens for an 'initGame' event from the client to create a new player.
   */
  socket.on('initGame', ({ username, width, height, className }) => {
    let x = GAME_WIDTH * Math.random()
    let y = GAME_HEIGHT * Math.random()

    // Object storing the different player class constructors
    const Classes = {
      Tank: Tank,
      Mage: Mage,
      Rogue: Rogue,
      Gunner: Gunner
    }

    // Create a new player object of the selected class
    const newPlayer = new Classes[className]({
      username: username, 
      x: x, 
      y: y,
      score: 0,
      sequenceNumber: 0
    })
    
    backEndPlayers[socket.id] = newPlayer
    newPlayer.socketId = socket.id // ADs the player ID to their player profile

    // Store the canvas settings for the player
    backEndPlayers[socket.id].canvas = {
      width,
      height
    }
    
    console.log(`Class: ${backEndPlayers[socket.id].constructor.name}, Health: ${backEndPlayers[socket.id].health}, Radius: ${backEndPlayers[socket.id].radius}, Speed: ${backEndPlayers[socket.id].speed}`)
    
    socket.emit('updateWeaponsOnJoin', backEndWeapons);
  })

  /**
   * Handles player disconnection.
   */
  socket.on('disconnect', (reason) => {
    console.log(reason) // Logs why the player disconnected
    delete backEndPlayers[socket.id] // Remove the player from the server's list
    io.emit('updatePlayers', backEndPlayers) // Send an updated player list to all clients
  })


  /**
   * Handles weapon selection
   */
  socket.on('weaponSelected', ({keycode, sequenceNumber}) => {
    const backEndPlayer = backEndPlayers[socket.id]

    if (!backEndPlayer) return // Checks if the player exists in the server

    backEndPlayer.sequenceNumber = sequenceNumber // Updates their sequenceNumber

    switch (keycode){
      case "Digit1":
        backEndPlayer.equippedWeapon = backEndPlayer.inventory[0] // adds the weapon to their first slot in inventory
        break
      case "Digit2":
        backEndPlayer.equippedWeapon = backEndPlayer.inventory[1] // adds the weapon to their second slot in inventory
        break
    }
  })

  /**
   * Handles player movement via key presses.
   */
  socket.on('keydown', ({ keycode, sequenceNumber }) => {
    const backEndPlayer = backEndPlayers[socket.id] // Assigns backEndPlayer with the player's current info

    if (!backEndPlayer) return // Ensure player exists before proceeding

    backEndPlayer.sequenceNumber = sequenceNumber // Sync the sequence number from the client
    
    // Move the player based on the key pressed
    switch (keycode) {
      case 'KeyW':
        backEndPlayers[socket.id].y -= 5 * backEndPlayer.speed
        break
      case 'KeyA':
        backEndPlayers[socket.id].x -= 5 * backEndPlayer.speed
        break
      case 'KeyS':
        backEndPlayers[socket.id].y += 5 * backEndPlayer.speed
        break
      case 'KeyD':
        backEndPlayers[socket.id].x += 5 * backEndPlayer.speed
        break
    }

    // Prevent the player from moving out of bounds
    const playerSides = {
      left: backEndPlayer.x - backEndPlayer.radius,
      right: backEndPlayer.x + backEndPlayer.radius,
      top: backEndPlayer.y - backEndPlayer.radius,
      bottom: backEndPlayer.y + backEndPlayer.radius
    }

    if (playerSides.left < 0) backEndPlayers[socket.id].x = backEndPlayer.radius
    if (playerSides.right > GAME_WIDTH) backEndPlayers[socket.id].x = GAME_WIDTH - backEndPlayer.radius
    if (playerSides.top < 0) backEndPlayers[socket.id].y = backEndPlayer.radius
    if (playerSides.bottom > GAME_HEIGHT) backEndPlayers[socket.id].y = GAME_HEIGHT - backEndPlayer.radius
  })
})

spawnWeapons(backEndWeapons, io) // function to randomly spawn weapons

// ------------------------------
// Backend Ticker (Game Loop)
// ------------------------------
setInterval(() => { 
  for (const playerId in backEndPlayers){
    const player = backEndPlayers[playerId]
    checkCollision(backEndWeapons, io, player)
  }
  
  // Update projectile positions
  for (const id in backEndProjectiles) {
    backEndProjectiles[id].x += backEndProjectiles[id].velocity.x
    backEndProjectiles[id].y += backEndProjectiles[id].velocity.y

    // Remove projectiles that go out of bounds
    if (
      backEndProjectiles[id].x - PROJECTILE_RADIUS >= GAME_WIDTH ||
      backEndProjectiles[id].x + PROJECTILE_RADIUS <= 0 ||
      backEndProjectiles[id].y - PROJECTILE_RADIUS >= GAME_HEIGHT ||
      backEndProjectiles[id].y + PROJECTILE_RADIUS <= 0
    ) {
      delete backEndProjectiles[id]
      continue
    }
    
    // Detect projectile collisions with players
    for (const playerId in backEndPlayers) {
      const backEndPlayer = backEndPlayers[playerId]
      // Calculate the distance between the player and the projectile
      const DISTANCE = Math.hypot(
        backEndProjectiles[id].x - backEndPlayer.x,
        backEndProjectiles[id].y - backEndPlayer.y
      )

      // Check if a collision occurred
      if (DISTANCE < PROJECTILE_RADIUS + backEndPlayer.radius &&
          backEndProjectiles[id].playerId !== playerId) {

        // Find the shooter (who fired the projectile)
        const shooter = backEndPlayers[backEndProjectiles[id].playerId]
        const equippedWeapon = shooter.equippedWeapon

        const weaponMtps = { // List of all possible weapon multipliers
          light: shooter.lightWpnMtp,
          heavy: shooter.heavyWpnMtp,
          magic: shooter.MagicWpnMtp
        }
        const weaponMtp = weaponMtps[equippedWeapon.type] // Obtains the specific weapon multiplier based on th weapons type

        if (shooter && equippedWeapon) {
          const totalDamage = equippedWeapon.damage * weaponMtp // Calculates the total damage based on multiplier
          backEndPlayers[playerId].health -=  totalDamage
        } else {
          console.log(`Error: Shooter or equipped weapon is undefined.`)
        }

        // If health reaches 0, remove the player and reward the shooter
        if (backEndPlayers[playerId].health <= 0) {
          backEndPlayers[backEndProjectiles[id].playerId].score++
          delete backEndPlayers[playerId]
        }

        // Remove the projectile
        delete backEndProjectiles[id]
        break
      }
    }
  }
  
  io.emit('updateProjectiles', backEndProjectiles)
  io.emit('updatePlayers', backEndPlayers)
}, 15)


// ------------------------------
// Start the Server
// ------------------------------
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`)
})

console.log('Server did load')


