/**
 * Listens for when the user clicks anywhere on the screen.
 * When clicked, this function calculates the direction of the shot
 * relative to the player's position and sends that data to the server.
 */
const canvasRect = canvas.getBoundingClientRect(); // Gets the top and left position of the canvas relative to the viewport

// Get the camera offsets as used in animate()
let cameraX = 0, cameraY = 0;
let pixelNumber = 2 * devicePixelRatio;

window.addEventListener("click", (event) => {
  const player = frontEndPlayers[socket.id]
  
  // Ensure the local player exists before proceeding
  if (!player) return;

  if (player.equippedWeapon.type == "melee" && player.canPunch) {
    socket.emit('punch')// Test------------------------------------
  } else{
    if (!player.canShoot) return // Checks to see if the frontEnd should even do the calculations
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
      worldMouseY- playerPosition.y,
      worldMouseX - playerPosition.x
    );

    /**
     * Sends a "shoot" event to the server.
     * This informs the server that the player has fired a shot.
     *
     * Data sent:
     * - `x, y`: Player’s current position.
     * - `angle`: The angle at which the projectile should be fired.
     */
    socket.emit("shoot", {
    x: playerPosition.x,
    y: playerPosition.y,
    angle
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
window.addEventListener("keydown", (event) => {
  // If the local player's data is not yet available, ignore input events
  if (!frontEndPlayers[socket.id]) return;

  if ((event.code === "Digit1" || event.code === "Digit2") && event.repeat)
    return;

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
      keys.num1.pressed = true
      break;
    case "Digit2":
      keys.num2.pressed = true
      break;
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
      // console.log("Tab up")
      break
    case "Digit1":
      keys.num1.pressed = false
      break
    case "Digit2":
      keys.num2.pressed = false
      break
  }
});