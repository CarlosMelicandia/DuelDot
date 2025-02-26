const canvas = document.querySelector('canvas') // Finds the canvas element from the HTML file
const ctx = canvas.getContext('2d') // Context in which the canvas is being made

const socket = io() // This is what allows for communication to happen between the client and the server and vice versa

const scoreEl = document.querySelector('#scoreEl') // Finds the element with id "scoreEL" from html file 

const devicePixelRatio = window.devicePixelRatio || 1 // Establishes the number of CSS pixels correspond to a pixel or falls back to 1

// Sets the canvas’s internal width and height
// Adjusts te canvas width and height to ensure proper resolution on multiple devices
canvas.width = 1024 * devicePixelRatio 
canvas.height = 576 * devicePixelRatio

ctx.scale(devicePixelRatio, devicePixelRatio) // Scales the drawing context so that drawing commands correspond to CSS pixels (ensuring a 1:1 ratio)

// Center of the canvas
const x = canvas.width / 2
const y = canvas.height / 2

// Empty objects to track number of players and projectiles
const frontEndPlayers = {}
const frontEndProjectiles = {}

/**
 * This method keeps the client (front end) projectiles list in sync with the server (back end) projectile list
 */
socket.on('updateProjectiles', (backEndProjectiles) => { // Waits until the server emits an "updateProjectiles" event
  for (const id in backEndProjectiles) { // Every server projectile is assigned an id
    const backEndProjectile = backEndProjectiles[id] 

    /** If a client projectile with the same id as the server is not found then it will 
    create a projectile object with x, y, radius, color, and velocity that match the server's projectile
    */
    if (!frontEndProjectiles[id]) { 
      frontEndProjectiles[id] = new Projectile({
        x: backEndProjectile.x,
        y: backEndProjectile.y,
        radius: 5,
        color: frontEndPlayers[backEndProjectile.playerId]?.color, // Checks if client Player with server projectiles id exists and assigns color if it does
        velocity: backEndProjectile.velocity
      })
    } else {
      // Updates the client projectiles position based on the velocity of the server's projectile
      frontEndProjectiles[id].x += backEndProjectiles[id].velocity.x
      frontEndProjectiles[id].y += backEndProjectiles[id].velocity.y
    }
  }


  /**
   * Checks for every client side projectile ID in all Client projectiles to see if it exists in server projectiles
   * if not it gets deleted from the client side projectiles list
   */
  for (const frontEndProjectileId in frontEndProjectiles) { 
    if (!backEndProjectiles[frontEndProjectileId]) {
      delete frontEndProjectiles[frontEndProjectileId]
    }
  }
})

/**
 * This method keeps the client (front end) players list in sync with the server (back end) players list 
 */
socket.on('updatePlayers', (backEndPlayers) => { // Waits until the server emits an "updatePlayers" event
  for (const id in backEndPlayers) { // For every ID in server players
    const backEndPlayer = backEndPlayers[id] // Assigns backEndPlayer to each player's ID

     /** If a client player with the same id as the server is not found then it will 
    create a player object with x, y, radius, color, and username that match the server's player
    */
    if (!frontEndPlayers[id]) {
      frontEndPlayers[id] = new Player ({
        x: backEndPlayer.x,
        y: backEndPlayer.y,
        radius: 10,
        color: backEndPlayer.color,
        username: backEndPlayer.username
      })

      // Adds that player with their attributes to the leaderboard
      document.querySelector(
        '#playerLabels'
      ).innerHTML += `<div data-id="${id}" data-score="${backEndPlayer.score}">${backEndPlayer.username}: ${backEndPlayer.score}</div>`
    } 
    /**
     * If the player exists in both client and server side it will
     * display and reorder the list so that the players are shown in
     * descending order
     */
    else {
      document.querySelector( // Updates the username of the player in the leaderboard to display their score
        `div[data-id="${id}"]`
      ).innerHTML = `${backEndPlayer.username}: ${backEndPlayer.score}`

      document
        .querySelector(`div[data-id="${id}"]`) // Selects a DOM element that matches the player's id
        .setAttribute('data-score', backEndPlayer.score) // Updates the label in HTML to show the players latest score from the server

      // sorts the players divs
      const parentDiv = document.querySelector('#playerLabels') // Assigns parentDiv to an html element with ID playerLabels
      const childDivs = Array.from(parentDiv.querySelectorAll('div')) // Assigns a copy of an Array of all players with their username and score so we can sort them

      // compares two elements a and b, which are the players scores and puts the higher one first
      childDivs.sort((a, b) => {
        const scoreA = Number(a.getAttribute('data-score'))
        const scoreB = Number(b.getAttribute('data-score'))

        return scoreB - scoreA // If the result is negative scoreA is bigger, if the result is positive scoreB is bigger
      })

      // removes child divs from the parent (outdated spots)
      childDivs.forEach((div) => {
        parentDiv.removeChild(div)
      })

      // Re-adds them but in a sorted way from higher to lower, shows the new score ranking
      childDivs.forEach((div) => {
        parentDiv.appendChild(div)
      })

      // Used for interpolation (get new values from existing ones) to match client's player position to server side
      frontEndPlayers[id].target = {
        x: backEndPlayer.x,
        y: backEndPlayer.y
      }

      // Checks if the player id matches clients id to run code specifically for that player
      if (id === socket.id) {
        const lastBackendInputIndex = playerInputs.findIndex((input) => { // Gets the last input from the server of that user
          return backEndPlayer.sequenceNumber === input.sequenceNumber
        })

        // Removes all inputs from playerInputs up to and including that index
        if (lastBackendInputIndex > -1)
          playerInputs.splice(0, lastBackendInputIndex + 1)

        // This ensures that the player's position on both the the client and the server stay in sync
        playerInputs.forEach((input) => {
          frontEndPlayers[id].target.x += input.dx
          frontEndPlayers[id].target.y += input.dy
        })
      }
    }
  }

  // Removes any player that no longer exists in backEndPLayers (server side)
  for (const id in frontEndPlayers) {
    if (!backEndPlayers[id]) {
      const divToDelete = document.querySelector(`div[data-id="${id}"]`)
      divToDelete.parentNode.removeChild(divToDelete)

      if (id === socket.id) {
        document.querySelector('#usernameForm').style.display = 'block'
      }

      delete frontEndPlayers[id]
    }
  }
})

/**
 * Function that updates the player position by moving them closer to their target and draws 
 * each player and projectile by recursively calling itself
 */
let animationId
function animate() {
  animationId = requestAnimationFrame(animate) // Tells the browser you want to do an animation
  // ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
  ctx.clearRect(0, 0, canvas.width, canvas.height) // Clears the canvas

  for (const id in frontEndPlayers) { // For ever player in the frontEndPLayers array
    const frontEndPlayer = frontEndPlayers[id] // Assigns a specific player to frontEndPlayer

    // linear interpolation (moving the player closer to the target) 
    // First checks to see if the client player has x and y and then proceeds to move the player halfway every frame
    if (frontEndPlayer.target) { // .target is an object containing the x and y coordinates of a player (client side)
      frontEndPlayers[id].x +=
        (frontEndPlayers[id].target.x - frontEndPlayers[id].x) * 0.5
      frontEndPlayers[id].y +=
        (frontEndPlayers[id].target.y - frontEndPlayers[id].y) * 0.5
    }

    frontEndPlayer.draw()
  }

  // Loops through each client side projectile in frontEndProjectiles and calls the draw method
  for (const id in frontEndProjectiles) {
    const frontEndProjectile = frontEndProjectiles[id]
    frontEndProjectile.draw()
  }

  // for (let i = frontEndProjectiles.length - 1; i >= 0; i--) {
  //   const frontEndProjectile = frontEndProjectiles[i]
  //   frontEndProjectile.update()
  // }
}

animate() // Calls the animate function

/**
 * Stores which movement key is being pressed
 */
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

const SPEED = 5 // How fast the player moves per tick
const playerInputs = [] // Stores the local inputs of a player
let sequenceNumber = 0 // Counts the number of movement inputs sent to the server
setInterval(() => {
  if (keys.w.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: 0, dy: -SPEED }) // Adds the playersInput info to the playerInputs Array
    // frontEndPlayers[socket.id].y -= SPEED
    socket.emit('keydown', { keycode: 'KeyW', sequenceNumber }) // Sends the information to the server
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
}, 15) // Checks which keys are pressed every 15 ms (Default: 15)

/**
 * Checks when a key is pressed and sets the value to true
 */
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

/**
 * Checks when a key is released and sets the value to false
 */
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

// Checks when the user has submitted their username
document.querySelector('#usernameForm').addEventListener('submit', (event) => {
  event.preventDefault() // Prevents the form from refreshing the page on submission
  document.querySelector('#usernameForm').style.display = 'none' // Hides the username form
  // Sends initGame which tells the server to track this player with their settings 
  socket.emit('initGame', {
    width: canvas.width,
    height: canvas.height,
    devicePixelRatio,
    username: document.querySelector('#usernameInput').value
  })
})
