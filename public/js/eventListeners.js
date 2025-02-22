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
    new Projectile(player.x, player.y, 5, 'white', velocity)
  )
})
