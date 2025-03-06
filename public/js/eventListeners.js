/**
 * Listens for when the user clicks anywhere on the screen.
 * When clicked, this function calculates the direction of the shot
 * relative to the player's position and sends that data to the server.
 */
addEventListener('click', (event) => {
  const canvas = document.querySelector('canvas') // Select the canvas element
  const { top, left } = canvas.getBoundingClientRect() // Gets the top and left position of the canvas relative to the viewport

  // Ensure the local player exists before proceeding
  if (!frontEndPlayers[socket.id]) return 

  const playerPosition = { // Stores the local player’s current position
    x: frontEndPlayers[socket.id].x,
    y: frontEndPlayers[socket.id].y
  }

  // Calculates the angle between the player's position and the mouse click location.
  const angle = Math.atan2(
    event.clientY - top - playerPosition.y,
    event.clientX - left - playerPosition.x
  )

  /**
   * Sends a "shoot" event to the server.
   * This informs the server that the player has fired a shot.
   * 
   * Data sent:
   * - `x, y`: Player’s current position.
   * - `angle`: The angle at which the projectile should be fired.
   */
  socket.emit('shoot', {
    x: playerPosition.x,
    y: playerPosition.y,
    angle
  })

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
})
