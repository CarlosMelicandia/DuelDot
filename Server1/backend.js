const express = require('express')
const app = express()

const Tank = require('./Tank.js')
const Mage = require('./Mage.js')
const Rogue = require('./Rogue.js')
const Gunner = require('./Gunner.js')

// socket.io setup
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 })

const port = 3000

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

const backEndPlayers = {}
const backEndProjectiles = {}

let projectileId = 0

io.on('connection', (socket) => {
  console.log('a user connected')

  io.emit('updatePlayers', backEndPlayers)

  socket.on('shoot', ({ x, y, angle }) => {
    projectileId++

    const velocity = {
      x: Math.cos(angle) * 5,
      y: Math.sin(angle) * 5
    }

    backEndProjectiles[projectileId] = {
      x,
      y,
      velocity,
      playerId: socket.id
    }

    console.log(backEndProjectiles)
  })
  

  socket.on('initGame', ({ username, width, height, className }) => {
    let x = 1024 * Math.random()
    let y = 576 * Math.random()
    const Classes = {
      Tank: Tank,
      Mage: Mage,
      Rogue: Rogue,
      Gunner: Gunner
    }

    const newPlayer = new Classes[className]({
      username: username, 
      x: x, 
      y: y,
      score: 0,
      sequenceNumber: 0
    })
    
    backEndPlayers[socket.id] = newPlayer

    // where we init our canvas
    backEndPlayers[socket.id].canvas = {
      width,
      height
    }
    console.log("Class:", backEndPlayers[socket.id].class,"\nHealth:", backEndPlayers[socket.id].health, "\nRadius:", backEndPlayers[socket.id].radius, "\nSpeed:", backEndPlayers[socket.id].speed)
  })

  socket.on('disconnect', (reason) => {
    console.log(reason)
    delete backEndPlayers[socket.id]
    io.emit('updatePlayers', backEndPlayers)
  })

  socket.on('keydown', ({ keycode, sequenceNumber }) => {
    const backEndPlayer = backEndPlayers[socket.id]

    if (!backEndPlayers[socket.id]) return

    backEndPlayers[socket.id].sequenceNumber = sequenceNumber
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

    const playerSides = {
      left: backEndPlayer.x - backEndPlayer.radius,
      right: backEndPlayer.x + backEndPlayer.radius,
      top: backEndPlayer.y - backEndPlayer.radius,
      bottom: backEndPlayer.y + backEndPlayer.radius
    }

    if (playerSides.left < 0) backEndPlayers[socket.id].x = backEndPlayer.radius

    if (playerSides.right > 1024)
      backEndPlayers[socket.id].x = 1024 - backEndPlayer.radius

    if (playerSides.top < 0) backEndPlayers[socket.id].y = backEndPlayer.radius

    if (playerSides.bottom > 576)
      backEndPlayers[socket.id].y = 576 - backEndPlayer.radius
  })
})

// backend ticker
setInterval(() => {
  // update projectile positions
  for (const id in backEndProjectiles) {
    backEndProjectiles[id].x += backEndProjectiles[id].velocity.x
    backEndProjectiles[id].y += backEndProjectiles[id].velocity.y

    const PROJECTILE_RADIUS = 5
    if (
      backEndProjectiles[id].x - PROJECTILE_RADIUS >=
        backEndPlayers[backEndProjectiles[id].playerId]?.canvas?.width ||
      backEndProjectiles[id].x + PROJECTILE_RADIUS <= 0 ||
      backEndProjectiles[id].y - PROJECTILE_RADIUS >=
        backEndPlayers[backEndProjectiles[id].playerId]?.canvas?.height ||
      backEndProjectiles[id].y + PROJECTILE_RADIUS <= 0
    ) {
      delete backEndProjectiles[id]
      continue
    }

    for (const playerId in backEndPlayers) {
      const backEndPlayer = backEndPlayers[playerId]

      const DISTANCE = Math.hypot(
        backEndProjectiles[id].x - backEndPlayer.x,
        backEndProjectiles[id].y - backEndPlayer.y
      )

      // collision detection
      if (
        DISTANCE < PROJECTILE_RADIUS + backEndPlayer.radius &&
        backEndProjectiles[id].playerId !== playerId
      ) {
        
      // Deal 25 damage instead of instant death
      if (!backEndPlayers[playerId].health) backEndPlayers[playerId].health = 100 // Fallback
       backEndPlayers[playerId].health -= 25
        
      // If health reaches 0 or below, remove the player and give the shooter a point
      if (backEndPlayers[playerId].health <= 0) {
        backEndPlayers[backEndProjectiles[id].playerId].score++
        delete backEndPlayers[playerId]
      }
        
      // Delete the projectile that hit
      delete backEndProjectiles[id]
        break
      }
    }
  }

  io.emit('updateProjectiles', backEndProjectiles)
  io.emit('updatePlayers', backEndPlayers)
}, 15)

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

console.log('server did load')
