addEventListener('click', (event) => {
  const angle = Math.atan2(
    event.clientY - player.y,
    event.clientX - player.x
  )
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5
  }
  projectiles.push(
    new Projectile(player.x, player.y, 5, 'white', velocity, 33.5)
  )
})

// Movement
addEventListener('keydown', function(e) {
  if (e.code == 'KeyW') vy = -2 * player.speed
  if (e.code == 'KeyD') vx = 2 * player.speed
  if (e.code == 'KeyS') vy = 2 * player.speed
  if (e.code == 'KeyA') vx = -2 * player.speed
})

addEventListener('keyup', function(e) {
  if (e.code == 'KeyW') vy = 0
  if (e.code == 'KeyD') vx = 0
  if (e.code == 'KeyS') vy = 0
  if (e.code == 'KeyA') vx = 0
})