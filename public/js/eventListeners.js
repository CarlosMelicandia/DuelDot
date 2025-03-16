/**
 * Listens for when the user clicks anywhere on the screen.
 * When clicked, this function calculates the direction of the shot
 * relative to the player's position and sends that data to the server.
 */
addEventListener("click", (event) => {
  const devicePixelRatio = window.devicePixelRatio || 1;
  const canvas = document.querySelector("canvas"); // Select the canvas element
  const canvasRect = canvas.getBoundingClientRect(); // Gets the top and left position of the canvas relative to the viewport
  const mouseX = event.clientX - canvasRect.left; // Get the mouse x cordinate relative to the canvas
  const mouseY = event.clientY - canvasRect.top; // Get the mouse y cordinate relative to the canvas

  // Ensure the local player exists before proceeding
  const localPlayer = frontEndPlayers[socket.id];
  if (!localPlayer) return;

  const playerPosition = {
    // Stores the local player’s current position
    x: localPlayer.x,
    y: localPlayer.y,
  };

  // Get the camera offsets as used in animate()
  let cameraX = 0, cameraY = 0;
  let pixelNumber = 2 * devicePixelRatio;

  if (localPlayer) {
    cameraX = localPlayer.x - canvas.width / pixelNumber;
    cameraY = localPlayer.y - canvas.height / pixelNumber;
  }

  // Convert mouse (screen) coordinates to game world cordinates
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
    angle,
  });

  /**
   * ********************
   * *                  *
   * *      IGNORE      *
   * *                  *
   * ********************
   *
   * The following code would create a local projectile immediately.
   * However, the game currently relies on the server to send projectile updates.
   * Uncommenting this would cause projectiles to be spawned client-side instead.
   */

  // const velocity = {
  //   x: Math.cos(angle) * 5,
  //   y: Math.sin(angle) * 5
  // }

  // frontEndProjectiles.push(
  //   new Projectile({
  //     x: playerPosition.x,
  //     y: playerPosition.y,
  //     radius: 5,
  //     color: 'white',
  //     velocity
  //   })
  // )
});
