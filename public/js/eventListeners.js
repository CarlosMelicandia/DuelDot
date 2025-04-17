/**
 * Listens for when the user clicks anywhere on the screen.
 * When clicked, this function calculates the direction of the shot
 * relative to the player's position and sends that data to the server.
 */
const canvasRect = canvas.getBoundingClientRect(); // Gets the top and left position of the canvas relative to the viewport

// Get the camera offsets as used in animate()
let pixelNumber = 2 * devicePixelRatio;

// 1 means slot 1 is selected, 2 means slot 2 is selected, -1 means no slot is selected
// Track the currently pressed key for weapon selection
let keyDown = -1;

window.addEventListener("click", (event) => {
  const player = frontEndPlayers[socket.id]
  
  
  // Ensure the local player exists before proceeding
  if (!player) return;

  const equippedWeapon = player.equippedWeapon

  if (equippedWeapon.name == "fist" && player.canPunch) {
    socket.emit('punch')
    return
  } else{
    if (!equippedWeapon.isReloaded || equippedWeapon.name == "fist") return // Checks to see if the frontEnd should even do the calculations
  }

  const mouseX = event.clientX - canvasRect.left; // Get the mouse x cordinate relative to the canvas
  const mouseY = event.clientY - canvasRect.top; // Get the mouse y cordinate relative to the canvas

  const playerPosition = {
    // Stores the local player’s current position
    x: player.x,
    y: player.y,
  };
  
  cameraX = player.x - canvas.width / pixelNumber;
  cameraY = player.y - canvas.height / pixelNumber;

  // Convert mouse (screen) coordinates to game world coordinates
  const worldMouseX = mouseX + cameraX;
  const worldMouseY = mouseY + cameraY;

  // Calculates the angle between the player's position to world mouse click location.
  const angle = Math.atan2(
    worldMouseY - playerPosition.y,
    worldMouseX - playerPosition.x
  );

  // Define the distance from the center of the player to the muzzle
  const muzzleOffset = equippedWeapon.topImageLength
  const sideOffset = 10;

  // Use trigonometry to calculate the muzzle coordinates
  const spawnX = 
    playerPosition.x +
    Math.cos(angle) * muzzleOffset +
    Math.cos(angle + Math.PI / 2) * sideOffset
    
  const spawnY = 
  playerPosition.y +
  Math.sin(angle) * muzzleOffset +
  Math.sin(angle + Math.PI / 2) * sideOffset

  /**
   * Sends a "shoot" event to the server.
   * This informs the server that the player has fired a shot.
   *
   * Data sent:
   * - `x, y`: Player’s current position.
   * - `angle`: The angle at which the projectile should be fired.
   */
  socket.emit("shoot", {
  x: spawnX,
  y: spawnY,
  angle: angle
  })
})

window.addEventListener('mousemove', (event) => {
  const player = frontEndPlayers[socket.id]
  
  if (!player) return

  const mouseX = event.clientX - canvasRect.left; // Get the mouse x cordinate relative to the canvas
  const mouseY = event.clientY - canvasRect.top; // Get the mouse y cordinate relative to the canvas

  cameraX = player.x - canvas.width / pixelNumber
  cameraY = player.y - canvas.height / pixelNumber

  const mouseAngle = Math.atan2(
    mouseY + cameraY - player.y,
    mouseX + cameraX - player.x
  )

  socket.emit('updateHands', mouseAngle)
})

// ------------------------------
// Event Listeners for Key Presses
// ------------------------------
/**
 * Listen for keydown events and mark the corresponding key as pressed.
 * This allows for continuous movement while the key is held.
 */
let isRepeated = false
window.addEventListener("keydown", (event) => {
  // If the local player's data is not yet available, ignore input events
  const frontEndPlayer = frontEndPlayers[socket.id]
  if (!frontEndPlayer) return;

  // if ((event.code === "Digit1" || event.code === "Digit2") && event.repeat) return

  switch (event.code) {
    case "KeyW":
      keys.w.pressed = true
      break;
    case "KeyA":
      keys.a.pressed = true
      break;
    case "KeyS":
      keys.s.pressed = true
      break;
    case "KeyD":
      keys.d.pressed = true
      break;
    case 'KeyQ':
      keys.q.pressed = true
      break
    case 'KeyF':
      keys.f.pressed = true
      break
    case "Tab":
      keys.tab.pressed = true
      break;
    case "Digit1":
      if (keyDown == -1) {
        keys.num1.pressed = true;
        keyDown = 1;
        break;
      }else if (keyDown == 2) {
        frontEndPlayer.inventorySlotSelected = 1
        keys.num1.pressed = true;
        keys.num2.pressed = false;
        keyDown = 1;
        break;
      }else {
        keys.num1.pressed = false;
        keyDown = -1;
        break;
      }
    case "Digit2":
      if (keyDown == -1) {
        keys.num2.pressed = true;
        keyDown = 2;
        break;
      }else if (keyDown == 1) {
        frontEndPlayer.inventorySlotSelected = 2
        keys.num2.pressed = true;
        keys.num1.pressed = false;
        keyDown = 2;
        break;
      }else {
        keys.num2.pressed = false;
        keyDown = -1;
        break;
      }
  }
});

/**
 * Listen for keyup events and mark the corresponding key as no longer pressed.
 */
window.addEventListener("keyup", (event) => {
  if (!frontEndPlayers[socket.id]) return;

  switch (event.code) {
    case "KeyW":
      keys.w.pressed = false
      break
    case "KeyA":
      keys.a.pressed = false
      break;
    case "KeyS":
      keys.s.pressed = false
      break
    case "KeyD":
      keys.d.pressed = false
      break
    case 'KeyQ':
      keys.q.pressed = false
      break
    case 'KeyF':
      keys.f.pressed = false
      break
    case "Tab":
      keys.tab.pressed = false
      break
    /*case "Digit1":
      keys.num1.pressed = false
      break
    case "Digit2":
      keys.num2.pressed = false
      break*/
  }
});