
// ------------------------------
// Canvas and Context Setup
// ------------------------------
const canvas = document.querySelector('canvas') // Finds the canvas element from the HTML file
const c = canvas.getContext('2d') // Context in which the canvas is being made

// ------------------------------
// Socket.IO and DOM Element Setup
// ------------------------------
const socket = io() // Allows for communication between the client and the server
const scoreEl = document.querySelector('#scoreEl') // Finds the element with ID "scoreEl" from the HTML file

// ------------------------------
// Device Pixel Ratio and Canvas Dimensions
// ------------------------------
const devicePixelRatio = window.devicePixelRatio || 1 // Gets the device's pixel ratio (for high-DPI displays), defaulting to 1 if unavailable

canvas.width = 1024 * devicePixelRatio // Sets the canvas’s internal width
canvas.height = 576 * devicePixelRatio // Sets the canvas’s internal height

c.scale(devicePixelRatio, devicePixelRatio) // Scales the drawing context so that drawing commands correspond to CSS pixels

// Center of the canvas
const x = canvas.width / 2
const y = canvas.height / 2

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
  "Rift", "BOB"
]

// ------------------------------
// Data Structures for Game Objects
// ------------------------------
const frontEndPlayers = {}  // Object to keep track of all player objects on the client
const frontEndProjectiles = {} // Object to keep track of all projectile objects on the client
let frontEndWeapons = {} // Object to keep track of all weapons objects on the client
let frontEndPowerUps = {}; // Object to track power-ups on the client


/**
 * ------------------------------
 * Handling Server Updates for Projectiles
 * ------------------------------
 */
/**
 * Keeps the front end (client-side) projectiles in sync with the back end (server).
 * When the server emits 'updateProjectiles', iterate over each projectile and
 * create or update them locally.
 */
socket.on('updateProjectiles', (backEndProjectiles) => { 
  // Loop over each projectile from the server (each has a unique id)
  for (const id in backEndProjectiles) {
    const backEndProjectile = backEndProjectiles[id]

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
        velocity: backEndProjectile.velocity
      })
    } else {
      // Update the client projectile’s position based on the server’s velocity
      frontEndProjectiles[id].x += backEndProjectiles[id].velocity.x
      frontEndProjectiles[id].y += backEndProjectiles[id].velocity.y
    }
  }

  /**
   * Remove any client-side projectiles that are no longer present on the server.
   */
  for (const frontEndProjectileId in frontEndProjectiles) {
    if (!backEndProjectiles[frontEndProjectileId]) {
      delete frontEndProjectiles[frontEndProjectileId]
    }
  }
})

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
      frontEndPlayers[id] = new Player ({
        x: backEndPlayer.x,
        y: backEndPlayer.y,
        radius: backEndPlayer.radius,
        color: backEndPlayer.color,
        username: backEndPlayer.username,
        health: backEndPlayer.health,  
        speed: backEndPlayer.speed,
      })
      
      // Add this player to the leaderboard 
      document.querySelector('#playerLabels').innerHTML += 
        `<div data-id="${id}" data-score="${backEndPlayer.score}">
          ${backEndPlayer.username}: ${backEndPlayer.score}
         </div>`
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

      // Update the player’s score in the leaderboard
      document.querySelector(`div[data-id="${id}"]`).innerHTML = 
        `${backEndPlayer.username}: ${backEndPlayer.score}`

      document
              .querySelector(`div[data-id="${id}"]`) // Selects a DOM element that matches the player's id
              .setAttribute('data-score', backEndPlayer.score) // Updates the label in HTML to show the players latest score from the server

      // Sort the players displayed in descending order by score
      const parentDiv = document.querySelector('#playerLabels')
      const childDivs = Array.from(parentDiv.querySelectorAll('div'))
      childDivs.sort((a, b) => {
        const scoreA = Number(a.getAttribute('data-score'))
        const scoreB = Number(b.getAttribute('data-score'))
        return scoreB - scoreA
      })
      childDivs.forEach((div) => {
        parentDiv.removeChild(div)
      })
      childDivs.forEach((div) => {
        parentDiv.appendChild(div)
      })

      // Used for interpolation (moving the player closer to its new position)
      frontEndPlayer.target = {
        x: backEndPlayer.x,
        y: backEndPlayer.y
      }

      if (id === socket.id) {
        const lastBackendInputIndex = playerInputs.findIndex((input) => { // Gets the last input from the server of that player
          return backEndPlayer.sequenceNumber === input.sequenceNumber
        })

        if (lastBackendInputIndex > -1) {
          playerInputs.splice(0, lastBackendInputIndex + 1)
        }

        // Reapply remaining inputs
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
      const divToDelete = document.querySelector(`div[data-id="${id}"]`)
      divToDelete.parentNode.removeChild(divToDelete)

      // If the local player has been removed, show the username form again
      if (id === socket.id) {
        document.querySelector('#usernameForm').style.display = 'block'
      }
      delete frontEndPlayers[id]
    }
  }
})

// Waits for an updateWeapons from the back end to sync and spawn weapons
socket.on('updateWeapons', (weaponData) =>{
  if (weaponData.remove){ // if the weapon has been removed due to collision
    delete frontEndWeapons[weaponData.id] // deletes weapon
  }else{
    if (!frontEndWeapons[weaponData.id]){ // Creates the weapon in the frontEnd if it doesn't exist
      frontEndWeapons[weaponData.id] = new WeaponDrawing(weaponData) // Contains only x, y, type, radius, and color
    }
  }
})

socket.on('dropWeapon', (weaponData) => {
  frontEndWeapons[weaponData.id] = new WeaponDrawing(weaponData)
}) 

class PowerUpDrawing {
  constructor({ id, x, y, radius, type }) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.type = type;
    this.image = new Image(); // Create an image object
    this.pulseSize = 0; // For the pulse animation
    this.pulseDirection = 1; // 1 for growing, -1 for shrinking
    this.maxPulseSize = 2; // Maximum size the pulse can grow
    this.pulseSpeed = 0.3; // Speed of the pulse animation


    // Assign different PNGs based on power-up type
    const powerUpImages = {
      "speed": "../assets/speed.png", 
      "multiShot": "../assets/MultishotPU.png",
      "health": "../assets/HealthPU.png",
      "damage": "../assets/DamagePU.png",
      "shield": "../assets/ShieldPU.png"
    };

    // Colors for the glow effect based on powerup type
    this.glowColors = {
      "speed": "#FFFF00", // Yellow
      "multiShot": "#FF0000", // Red
      "health": "#00FF00", // Green
      "damage": "#FFA500", // Orange
      "shield": "#0000FF", // Blue
    };

    this.image.src = powerUpImages[this.type] || "../assets/speed.png";

  }

  draw() {
    // Update the pulse animation
    this.pulseSize += this.pulseDirection * this.pulseSpeed;
    if (this.pulseSize >= this.maxPulseSize) {
      this.pulseDirection = -1;
    } else if (this.pulseSize <= 0) {
      this.pulseDirection = 1;
    }

    // Draw the glow/pulse effect
    c.save();
    c.beginPath();
    c.arc(this.x, this.y, this.radius + this.pulseSize, 0, Math.PI * 2);
    c.fillStyle = this.glowColors[this.type] || "#FFFF00";
    c.globalAlpha = 0.3; // Make the glow semi-transparent
    c.fill();
    c.closePath();
    c.restore();

    c.drawImage(this.image, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
  }
}

socket.on('updatePowerUps', (backEndPowerUps, powerUpData) => {
  if (powerUpData.remove) { // If the power-up was collected, remove it
    delete frontEndPowerUps[powerUpData.id];
  } else {
    if (!frontEndPowerUps[powerUpData.id]) { // Create the power-up if it doesn't exist
      frontEndPowerUps[powerUpData.id] = new PowerUpDrawing(powerUpData); // Stores the power-up data
    }
  }
});

socket.on('powerupCollected', (powerupData) => {
  const player = frontEndPlayers[socket.id];
  if (!player) return;

  // Apply powerup effect for visual feedback
  player.applyPowerup(powerupData.type, powerupData.duration);
});


// When a players joins it shows them the weapons that had spawned previously
socket.on('updateWeaponsOnJoin', (backEndWeapons) => {
  frontEndWeapons = {}

  backEndWeapons.forEach((weapon) => {
    frontEndWeapons[weapon.id] = new WeaponDrawing(weapon)
  })
})

socket.on('updatePowerUpsOnJoin', (backEndPowerUps) => {
  frontEndPowerUps = {};
  backEndPowerUps.forEach((powerUp) => {
    frontEndPowerUps[powerUp.id] = new PowerUpDrawing(powerUp);
  });
});


// Waits for a weapon equip call from the server
socket.on('equipWeapon', (weaponEquipped, player) => {
  if (player.inventory[0] && !player.inventory[1]){ // if the first inventory is open 
    document.querySelector('#inventorySlot1Text').textContent = weaponEquipped.name // Show weapon in inventory
  }else {
    if(player.inventory[1]){ // if the second inventory is open
    document.querySelector('#inventorySlot2Text').textContent = weaponEquipped.name // Shows the weapon in the second slot
  }
}
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
let animationId
function animate() {
  animationId = requestAnimationFrame(animate) // Tells the browser we want to perform an animation
  // c.fillStyle = 'rgba(0, 0, 0, 0.1)' // Optional "ghosting" effect if needed
  c.clearRect(0, 0, canvas.width, canvas.height) // Clears the entire canvas

  // Interpolate and draw each player
  for (const id in frontEndPlayers) {
    const frontEndPlayer = frontEndPlayers[id]

    // linear interpolation (move the player closer to its target)
    if (frontEndPlayer.target) {
      frontEndPlayers[id].x +=
        (frontEndPlayers[id].target.x - frontEndPlayers[id].x) * 0.5
      frontEndPlayers[id].y +=
        (frontEndPlayers[id].target.y - frontEndPlayers[id].y) * 0.5
    }
    frontEndPlayer.draw({ xPosition: frontEndPlayer.handXMove, angle: frontEndPlayer.aimAngle })
  }

  for (const weapon in frontEndWeapons){
    const frontEndWeapon = frontEndWeapons[weapon]
    frontEndWeapon.draw()
  }

  //Draw the PowerUps
  for (const powerUp in frontEndPowerUps) {
    const frontEndPowerUp = frontEndPowerUps[powerUp];
    frontEndPowerUp.draw();
  }
  

  // Draw each projectile
  for (const id in frontEndProjectiles) {
    const frontEndProjectile = frontEndProjectiles[id]
    frontEndProjectile.draw()
  }
}

animate()

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
  num1: { pressed: false },
  num2: { pressed: false }
}

/**
 * We keep a local buffer (playerInputs) of all unacknowledged inputs. 
 * The server eventually sends back a sequenceNumber acknowledging the last
 * processed input, and we remove old inputs from this list.
 */
const playerInputs = []
let sequenceNumber = 0

/**
 * Every 15 milliseconds, check which keys are pressed.
 * If a key is pressed, record the input and send it to the server.
 */
setInterval(() => {
  // Ensure the local player exists before trying to move
  const player = frontEndPlayers[socket.id]
  if (!player) return

  // Dynamically get the player's speed
  const SPEED = 5 * player.speed 

  /**
   * Player movement
   */

  if (keys.w.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: 0, dy: -SPEED })
    socket.emit('keydown', { keycode: 'KeyW', sequenceNumber })
  }

  if (keys.a.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: -SPEED, dy: 0 })
    socket.emit('keydown', { keycode: 'KeyA', sequenceNumber })
  }

  if (keys.s.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: 0, dy: SPEED })
    socket.emit('keydown', { keycode: 'KeyS', sequenceNumber })
  }

  if (keys.d.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: SPEED, dy: 0 })
    socket.emit('keydown', { keycode: 'KeyD', sequenceNumber })
  }

  /**
   * Drop Weapons
   */

    if (keys.q.pressed){
      sequenceNumber++
      playerInputs.push({ sequenceNumber, dx: 0, dy: 0 })
      socket.emit('weaponDrop', { keycode: 'KeyD', sequenceNumber })
    }

  /**
   * Inventory 
   */
  if (keys.num1.pressed) {
    sequenceNumber++ 
    playerInputs.push({ sequenceNumber, dx: 0, dy: 0 })
    document.querySelector('#inventorySlot1').style.borderColor = "blue" // Highlights the first Inventory Slot
    socket.emit('weaponSelected', { keycode: 'Digit1', sequenceNumber} ) // Emits the information back to the server
  } else{
    if (!keys.num1.pressed && keys.num2.pressed){
      document.querySelector('#inventorySlot1').style.borderColor = "white" // Turns the inventory back to original color
    }
  }

  if (keys.num2.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: 0, dy: 0 })
    document.querySelector('#inventorySlot2').style.borderColor = "blue" // Highlights the second Inventory Slot
    socket.emit('weaponSelected', { keycode: 'Digit2', sequenceNumber} ) // Emits the information back to the server 
  } else{
    if (keys.num1.pressed && !keys.num2.pressed){
      document.querySelector('#inventorySlot2').style.borderColor = "white" // Turns the inventory back to original color
    }
  }
}, 15) // (default: 15)

// ------------------------------
// Event Listeners for Key Presses
// ------------------------------
/**
 * Listen for keydown events and mark the corresponding key as pressed.
 * This allows for continuous movement while the key is held.
 */
window.addEventListener('keydown', (event) => {
  // If the local player's data is not yet available, ignore input events
  if (!frontEndPlayers[socket.id]) return

  
  if ((event.code === 'Digit1' || event.code === 'Digit2') && event.repeat) return

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
    case 'KeyQ':
      keys.q.pressed = true
      break
    case 'Digit1':
      keys.num1.pressed = true
      break
    case 'Digit2':
      keys.num2.pressed = true
      break
  }
})

/**
 * Listen for keyup events and mark the corresponding key as no longer pressed.
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
    case 'KeyQ':
      keys.q.pressed = false
      break
    case 'Digit1':
      keys.num1.pressed = false
      break
    case 'Digit2':
      keys.num2.pressed = false
      break
  }
})

// ------------------------------
// Class Selection Handling
// ------------------------------
const classSelectors = ["Tank", "Rogue", "Mage", "Gunner"] // Possible classes
let classSelection = 0 // Starts in Tank
let className = classSelectors[classSelection] // Selects the class

/**
 * Cycles forward in the array
 * @returns the selected class
 */
function nextClass() {
  classSelection = (classSelection + 1) % (classSelectors.length)
  return classSelectors[classSelection]
}

/**
 * Cycles Backwards in the array
 * @returns the selected class
 */
function previousClass() {
  classSelection = (classSelection - 1 + classSelectors.length) % classSelectors.length
  return classSelectors[classSelection]
}

document.querySelector('#showClass').textContent = "Class: " + className // Displays the first class

// When the user clicks the -> arrow it goes to the next class  
document.querySelector('#classSelectorRight').addEventListener('click', () => { 
  className = nextClass()
  document.querySelector('#showClass').textContent = "Class: " + className
})

// When the user clicks the <- arrow it goes to the previous class 
document.querySelector('#classSelectorLeft').addEventListener('click', () => {
  className = previousClass()
  document.querySelector('#showClass').textContent = "Class: " + className
})

// ------------------------------
// Random Username Handling
// ------------------------------
/**
 * Generate a random name that isn't already in use by another player on the client.
 * If the generated name is taken, recurse until a unique name is found.
 */
function selectName() {
  let playerNameNumber = Math.floor(Math.random() * playerNames.length)
  let name = playerNames[playerNameNumber] 
  for (const id in frontEndPlayers) { 
    if (frontEndPlayers[id].username === name) {
      // If name is already taken by a current player, try again
      return selectName()
    }
  }
  return name
}

let playerName = selectName()
document.querySelector('#selectedRandomName').textContent = playerName

document.querySelector('#randomNameBtn').addEventListener('click', () => {
  // Generate a new random name when clicked
  playerName = selectName()
  document.querySelector('#selectedRandomName').textContent = playerName
})

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
  socket.emit('initGame', {
    width: canvas.width,
    height: canvas.height,
    devicePixelRatio,
    username: playerName,
    className
  })
})
