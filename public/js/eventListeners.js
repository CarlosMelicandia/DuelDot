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

  // Check if multi-shot power-up is active
  if (frontEndPlayers[socket.id].activePowerUps && 
    frontEndPlayers[socket.id].activePowerUps['multiShot']) {
      // For multi-shot, fire bullets in a radius
      const numProjectiles = 8; // Number of bullets in the radius
      
      for (let i = 0; i < numProjectiles; i++) {
        // Calculate angles in a circle around the player
        const spreadAngle = Math.PI / 6; // Adjust spread width
        const projectileAngle = angle + spreadAngle * ((i / (numProjectiles - 1)) - 0.5);

        // Send each projectile to the server
        socket.emit('shoot', {
          x: playerPosition.x,
          y: playerPosition.y,
          angle: projectileAngle
        });
      }
    } else {
      // Regular single-shot logic
      socket.emit('shoot', {
        x: playerPosition.x,
        y: playerPosition.y,
        angle
      })
    }

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
