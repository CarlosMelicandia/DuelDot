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

  if (player.equippedWeapon.type == "melee") {
    setTimeout (() => {
      player.handXMove = 25
    }, 1000)
    player.handXMove = 30
    // socket.emit('punch', {

    // })// Test------------------------------------
  } else{

    console.log(player.canShoot)
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

    // frontEndPlayers[socket.id].drawHands() 
    console.log("Shoot")

    /**
     * Sends a "shoot" event to the server.
     * This informs the server that the player has fired a shot.
     * 
     * Data sent:
     * - `x, y`: Player’s current position.
     * - `angle`: The angle at which the projectile should be fired.
     */

    console.log("shoot")
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

addEventListener('mousemove', (event) => {
  const player = frontEndPlayers[socket.id]
  if (!player) return
  const { top, left } = canvas.getBoundingClientRect()

  const mouseAngle = Math.atan2(
    event.clientY - top - player.y,
    event.clientX - left - player.x
  )

  player.aimAngle = mouseAngle
})
