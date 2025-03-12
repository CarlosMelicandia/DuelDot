/**
 * Checks for when the user clicks
 */
addEventListener('click', (event) => { 
  const { top, left } = canvas.getBoundingClientRect() // Gets the top and left position from the canvas
  const playerPosition = { // playerPosition holds both x and y
    x: frontEndPlayers[socket.id].x, // This gets a specific player's x and y position
    y: frontEndPlayers[socket.id].y
  }

  /**
   * Calculates the angle between the click and players position
   * event.clientY = mouse click coordinate in the Y axis
   * event.clientX = mouse click coordinate in the X axis
   */
  const angle = Math.atan2(
    event.clientY - top - playerPosition.y,
    event.clientX - left - playerPosition.x
  )

/**
 * .emit sends information to the server from the client o vice versa
 * Here it sends the players x and y position alongside the angle of the shot
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
