// ------------------------------
// Module Imports and Server Setup
// ------------------------------
const express = require('express') // imports the express module
const app = express() // creates an instance of an Express application

// ------------------------------
// Socket.IO Setup
// ------------------------------
const http = require('http') // Import Node's built-in HTTP module
const server = http.createServer(app) // Create an HTTP server using the Express app
const { Server } = require('socket.io')  // Import the Socket.IO Server class

/**
 * Creates a Socket.io server instance
 * pingInterval is the interval (2 seconds) at which the server sends ping packets to the client
 * pingTimeout is the maximum time (5 seconds) the server waits for a pong response before considering the client disconnected
 */
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 })

const port = 3000 // Default port in which the server runs as LocalHot

// ------------------------------
// Express Middleware and Routes
// ------------------------------
app.use(express.static('public')) // Any files placed in the public folder become accessible to clients via http requests

// When a player visits the root url (e.g http://localhost:3000/) they receive the index.html file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html') //_dirname is this file's absolute path
})

// ------------------------------
// Server-side Data Structures
// ------------------------------
const backEndPlayers = {} // List of objects that contain amount of players server side
const backEndProjectiles = {} // List of objects that contain amount of projectiles server side

const SPEED = 5 // Movement speed of the player (default: 5)
const RADIUS = 10 // Radius of the player (default: 10)
const PROJECTILE_RADIUS = 5 // Radius of the projectile (default: 10) 
let projectileId = 0 // A unique id counter for each projectile created

// ------------------------------
// Socket.IO Connection and Event Handlers
// ------------------------------
io.on('connection', (socket) => { //  io.on listens for an event that is sent to the server via .emit()
  console.log('a user connected') // logs that a player has connected

  io.emit('updatePlayers', backEndPlayers) // Send the current list of players to all connected clients

  /**
   * When the client emits a shoot event it creates a new projectile
   */
  socket.on('shoot', ({ x, y, angle }) => { 
    projectileId++ // Adds an ID to the projectile

    // Calculates the velocity of the projectile based on the angle given by the client
    const velocity = {
      x: Math.cos(angle) * 5,
      y: Math.sin(angle) * 5
    }

    // Creates a new server projectile with the given position, velocity, and the player's socket id
    backEndProjectiles[projectileId] = {
      x,
      y,
      velocity,
      playerId: socket.id
    }
  })

  /**
   * Listens for an initGame event from the client to create a player
   */
  socket.on('initGame', ({ username, width, height }) => {
    // Creates a new server player with a random position and color
    backEndPlayers[socket.id] = {
      x: GAME_WIDTH * Math.random(),
      y: GAME_HEIGHT * Math.random(),
      color: `hsl(${360 * Math.random()}, 100%, 50%)`,
      sequenceNumber: 0, // tracks the order of movement inputs from the client
      score: 0, // Initial score
      username // Player's username provided by the client
    }

    // Store the canvas settings for a player
    backEndPlayers[socket.id].canvas = {
      width,
      height
    }

    backEndPlayers[socket.id].radius = RADIUS // Sets the player radius
  })

  /**
   * Listens for a disconnect event from the client to handle player disconnects
   */
  socket.on('disconnect', (reason) => {
    console.log(reason) // Logs the reasons for player disconnection
    delete backEndPlayers[socket.id] // Removes the player from the server's list
    io.emit('updatePlayers', backEndPlayers) // Sends an updated lists of all players to all clients
  })

  /**
   * Listens for a keydown press for movement from the client
   */
  socket.on('keydown', ({ keycode, sequenceNumber }) => {
    const backEndPlayer = backEndPlayers[socket.id] // Assigns backEndPlayer with the player's current info

    if (!backEndPlayers[socket.id]) return // Checks to see if the player exists

    backEndPlayers[socket.id].sequenceNumber = sequenceNumber // Syncs the player's stored sequence number with the client's latest sequence number
    
    // Moves the player based on the key pressed
    switch (keycode) {
      case 'KeyW':
        backEndPlayers[socket.id].y -= SPEED
        break

      case 'KeyA':
        backEndPlayers[socket.id].x -= SPEED
        break

      case 'KeyS':
        backEndPlayers[socket.id].y += SPEED
        break

      case 'KeyD':
        backEndPlayers[socket.id].x += SPEED
        break
    }

    // Calculate the boundaries (sides) of the player for collision with the canvas edges
    const playerSides = {
      left: backEndPlayer.x - backEndPlayer.radius, // Gets the most left value of the player
      right: backEndPlayer.x + backEndPlayer.radius, // Gets the most right value of the player
      top: backEndPlayer.y - backEndPlayer.radius,  // Gets the  top value of the player
      bottom: backEndPlayer.y + backEndPlayer.radius  // Gets the bottom value of the player
    }

    if (playerSides.left < 0) // Checks to see if the player is out of bounds on the left side
      backEndPlayers[socket.id].x = backEndPlayer.radius // If it is it sets their x position to their radius

    if (playerSides.right > GAME_WIDTH) // Checks to see if the player is out of bounds on the right side
      backEndPlayers[socket.id].x = GAME_WIDTH - backEndPlayer.radius // If they are it changes their x to keep them in bound

    if (playerSides.top < 0) // Checks to see if the player is out of bounds on the top side
      backEndPlayers[socket.id].y = backEndPlayer.radius // If they are it changes their y to keep them in bound

    if (playerSides.bottom > GAME_HEIGHT) // Checks to see if the player is out of bounds on the bottom side
      backEndPlayers[socket.id].y = GAME_HEIGHT - backEndPlayer.radius // If they are it changes their y to keep them in bound
  })
})

// ------------------------------
// Backend Ticker (Game Loop)
// ------------------------------
setInterval(() => {
  // update projectile positions based on its velocity
  for (const id in backEndProjectiles) {
    backEndProjectiles[id].x += backEndProjectiles[id].velocity.x
    backEndProjectiles[id].y += backEndProjectiles[id].velocity.y
    
    if (
      // Checks to see if the projectile has left the the right side of the screen (the ? checks whether it exists before use)
      backEndProjectiles[id].x - PROJECTILE_RADIUS >= backEndPlayers[backEndProjectiles[id].playerId]?.canvas?.width ||
      backEndProjectiles[id].x + PROJECTILE_RADIUS <= 0 || // Checks to see if the projectile has left the left side of the screen
      // Checks to see if the projectile has left the the bottom side of the screen (the ? checks whether it exists before use)
      backEndProjectiles[id].y - PROJECTILE_RADIUS >=
        backEndPlayers[backEndProjectiles[id].playerId]?.canvas?.height ||
      backEndProjectiles[id].y + PROJECTILE_RADIUS <= 0 // Checks to see if the projectile has left the top side of the screen
    ) {
      delete backEndProjectiles[id] // if so it deletes that projectile
      continue
    }

    // Detects whether a projectile has hit another player
    for (const playerId in backEndPlayers) {
      const backEndPlayer = backEndPlayers[playerId]

      // Calculates the distance between the player's position and the projectile's position
      const DISTANCE = Math.hypot(
        backEndProjectiles[id].x - backEndPlayer.x,
        backEndProjectiles[id].y - backEndPlayer.y
      )

      // If the distance is less than the sum of the projectile's and player's radius,
      // and the projectile was not shot by the same player, a collision has occurred.
      if (
        DISTANCE < PROJECTILE_RADIUS + backEndPlayer.radius &&
        backEndProjectiles[id].playerId !== playerId
      ) {
        // Checks to see if the player that shot the projectile exists
        if (backEndPlayers[backEndProjectiles[id].playerId]) 
          backEndPlayers[backEndProjectiles[id].playerId].score++ // Increments their scores

        console.log(backEndPlayers[backEndProjectiles[id].playerId]) // Logs which player got hit
        delete backEndProjectiles[id] // Removes the projectile when collision occurs 
        delete backEndPlayers[playerId] // Removes the player when collision occurs 
        break // Exit the inner loop after handling the collision
      }
    }
  }

  // Emit updated projectile and player data to all connected clients
  io.emit('updateProjectiles', backEndProjectiles) 
  io.emit('updatePlayers', backEndPlayers)
}, 15) // Amount of time in which the ticker runs (Default: 15)

// ------------------------------
// Start the Server
// ------------------------------
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`)
})

console.log('server did load')
