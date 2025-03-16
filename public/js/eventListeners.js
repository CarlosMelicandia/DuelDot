/**
 * Listens for when the user clicks anywhere on the screen.
 * When clicked, this function calculates the direction of the shot
 * relative to the player's position and sends that data to the server.
 */
addEventListener('click', (event) => {
  const canvas = document.querySelector('canvas') // Select the canvas element
  const { top, left } = canvas.getBoundingClientRect() // Gets the top and left position of the canvas relative to the viewport
  const player = frontEndPlayers[socket.id]

  // Ensure the local player exists before proceeding
  if (!player) return 

  if (player.equippedWeapon.type == "melee" && player.canPunch) {
    socket.emit('punch')// Test------------------------------------
  } else{
    if (!player.canShoot) return // Checks to see if the frontEnd should even do the calculations
    
    const playerPosition = { // Stores the local player’s current position
      x: player.x,
      y: player.y
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
  }
})

addEventListener('mousemove', (event) => {
  const { top, left } = canvas.getBoundingClientRect()

  const player = frontEndPlayers[socket.id]
  if (!player) return

  const mouseAngle = Math.atan2(
    event.clientY - top - player.y,
    event.clientX - left - player.x
  )

  // player.aimAngle = mouseAngle

  socket.emit('updateHands', mouseAngle)

})
