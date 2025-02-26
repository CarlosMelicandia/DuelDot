const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const socket = io()

const scoreEl = document.querySelector('#scoreEl')

const devicePixelRatio = window.devicePixelRatio || 1

canvas.width = 1024 * devicePixelRatio
canvas.height = 576 * devicePixelRatio

c.scale(devicePixelRatio, devicePixelRatio)

const x = canvas.width / 2
const y = canvas.height / 2

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
  "Rift"
]


/**
 * ------------------------------
 * Data Structures for Game Objects
 * ------------------------------
 */
const frontEndPlayers = {} // Object to keep track of all player objects on the client
const frontEndProjectiles = {}  // Object to keep track of all projectile objects on the client

/**
 * ------------------------------
 * Handling Server Updates for Projectiles
 * ------------------------------
 */
/**
 * Keeps the front end (client-side) projectiles in sync with the back end (server).
 * When the server emits 'updateProjectiles', iterate over each projectile.
 */
socket.on('updateProjectiles', (backEndProjectiles) => { // Waits until the server emits an "updateProjectiles" event
  for (const id in backEndProjectiles) { // Loop over each projectile from the server (each has a unique id)
    const backEndProjectile = backEndProjectiles[id] 

    if (!frontEndProjectiles[id]) {
      frontEndProjectiles[id] = new Projectile({
        x: backEndProjectile.x,
        y: backEndProjectile.y,
        radius: 5,
        color: frontEndPlayers[backEndProjectile.playerId]?.color,
        velocity: backEndProjectile.velocity
      })
    } else {
      frontEndProjectiles[id].x += backEndProjectiles[id].velocity.x
      frontEndProjectiles[id].y += backEndProjectiles[id].velocity.y
    }
  }

  for (const frontEndProjectileId in frontEndProjectiles) {
    if (!backEndProjectiles[frontEndProjectileId]) {
      delete frontEndProjectiles[frontEndProjectileId]
    }
  }
})

socket.on('updatePlayers', (backEndPlayers) => {
  for (const id in backEndPlayers) {
    const backEndPlayer = backEndPlayers[id]

    if (!frontEndPlayers[id]) {
      frontEndPlayers[id] = new Player({
        x: backEndPlayer.x,
        y: backEndPlayer.y,
        radius: 10,
        color: backEndPlayer.color,
        username: backEndPlayer.username
      })

      document.querySelector(
        '#playerLabels'
      ).innerHTML += `<div data-id="${id}" data-score="${backEndPlayer.score}">${backEndPlayer.username}: ${backEndPlayer.score}</div>`
    } else {
      document.querySelector(
        `div[data-id="${id}"]`
      ).innerHTML = `${backEndPlayer.username}: ${backEndPlayer.score}`

      document
        .querySelector(`div[data-id="${id}"]`)
        .setAttribute('data-score', backEndPlayer.score)

      // sorts the players divs
      const parentDiv = document.querySelector('#playerLabels')
      const childDivs = Array.from(parentDiv.querySelectorAll('div'))

      childDivs.sort((a, b) => {
        const scoreA = Number(a.getAttribute('data-score'))
        const scoreB = Number(b.getAttribute('data-score'))

        return scoreB - scoreA
      })

      // removes old elements
      childDivs.forEach((div) => {
        parentDiv.removeChild(div)
      })

      // adds sorted elements
      childDivs.forEach((div) => {
        parentDiv.appendChild(div)
      })

      frontEndPlayers[id].target = {
        x: backEndPlayer.x,
        y: backEndPlayer.y
      }

      if (id === socket.id) {
        const lastBackendInputIndex = playerInputs.findIndex((input) => {
          return backEndPlayer.sequenceNumber === input.sequenceNumber
        })

        if (lastBackendInputIndex > -1)
          playerInputs.splice(0, lastBackendInputIndex + 1)

        playerInputs.forEach((input) => {
          frontEndPlayers[id].target.x += input.dx
          frontEndPlayers[id].target.y += input.dy
        })
      }
    }
  }

  // this is where we delete frontend players
  for (const id in frontEndPlayers) {
    if (!backEndPlayers[id]) {
      const divToDelete = document.querySelector(`div[data-id="${id}"]`)
      divToDelete.parentNode.removeChild(divToDelete)

       // If the local player has been removed, show the username form again
      // if (id === socket.id) {
      //   document.querySelector('#usernameForm').style.display = 'block'
      // }

      delete frontEndPlayers[id]
    }
  }
})

let animationId
function animate() {
  animationId = requestAnimationFrame(animate)
  // c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.clearRect(0, 0, canvas.width, canvas.height)

  for (const id in frontEndPlayers) {
    const frontEndPlayer = frontEndPlayers[id]

    // linear interpolation
    if (frontEndPlayer.target) {
      frontEndPlayers[id].x +=
        (frontEndPlayers[id].target.x - frontEndPlayers[id].x) * 0.5
      frontEndPlayers[id].y +=
        (frontEndPlayers[id].target.y - frontEndPlayers[id].y) * 0.5
    }

    frontEndPlayer.draw()
  }

  for (const id in frontEndProjectiles) {
    const frontEndProjectile = frontEndProjectiles[id]
    frontEndProjectile.draw()
  }

  // for (let i = frontEndProjectiles.length - 1; i >= 0; i--) {
  //   const frontEndProjectile = frontEndProjectiles[i]
  //   frontEndProjectile.update()
  // }
}

animate()

const keys = {
  w: {
    pressed: false
  },
  a: {
    pressed: false
  },
  s: {
    pressed: false
  },
  d: {
    pressed: false
  }
}

const SPEED = 5
const playerInputs = []
let sequenceNumber = 0
setInterval(() => {
  if (keys.w.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: 0, dy: -SPEED })
    // frontEndPlayers[socket.id].y -= SPEED
    socket.emit('keydown', { keycode: 'KeyW', sequenceNumber })
  }

  if (keys.a.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: -SPEED, dy: 0 })
    // frontEndPlayers[socket.id].x -= SPEED
    socket.emit('keydown', { keycode: 'KeyA', sequenceNumber })
  }

  if (keys.s.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: 0, dy: SPEED })
    // frontEndPlayers[socket.id].y += SPEED
    socket.emit('keydown', { keycode: 'KeyS', sequenceNumber })
  }

  if (keys.d.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: SPEED, dy: 0 })
    // frontEndPlayers[socket.id].x += SPEED
    socket.emit('keydown', { keycode: 'KeyD', sequenceNumber })
  }
}, 15)

window.addEventListener('keydown', (event) => {
  if (!frontEndPlayers[socket.id]) return

  switch (event.code) {
    case 'KeyW':
      keys.w.pressed = true
      break

    case 'KeyA':
      keys.a.pressed = true
      break

    case 'KeyS':
      keys.s.pressed = true
      break

    case 'KeyD':
      keys.d.pressed = true
      break
  }
})

window.addEventListener('keyup', (event) => {
  if (!frontEndPlayers[socket.id]) return

  switch (event.code) {
    case 'KeyW':
      keys.w.pressed = false
      break

    case 'KeyA':
      keys.a.pressed = false
      break

    case 'KeyS':
      keys.s.pressed = false
      break

    case 'KeyD':
      keys.d.pressed = false
      break
  }
})

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


// document.querySelector('#usernameForm').addEventListener('submit', (event) => {
//   event.preventDefault() // Prevents the form from refreshing the page on submission
//   document.querySelector('#usernameForm').style.display = 'none' // Hides the username form
//   // Sends initGame which tells the server to track this player with their settings 
// socket.emit('initGame', {
//     width: canvas.width,
//     height: canvas.height,
//     devicePixelRatio,
//     username: document.querySelector('#usernameInput').value
//   })
// })

// Randomly selects a number from 0 to playerNames.length - 1
playerNameNumber = Math.floor(Math.random() * (playerNames.length))
for (const id in frontEndPlayers){
  frontEndPlayer = frontEndPlayers[id]
  if (frontEndPlayer.username == playerNames[playerNameNumber]) // Ensures that no name is repeated
    playerNameNumber = Math.floor(Math.random() * (playerNames.length))
}

socket.emit('initGame', {
    width: canvas.width,
    height: canvas.height,
    devicePixelRatio,
    username: playerNames[playerNameNumber]
})
