class Projectile {
  constructor({ x, y, radius, color = 'white', velocity }) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
  }

  draw() {
    ctx.save()
    ctx.shadowColor = this.color // outside shadow of the player (gives a glowy look to the player)
    ctx.shadowBlur = 20 // How big the glowy look is going to be
    ctx.beginPath() // Clears the path so that the new shape isn't connected to the previous one
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false) // Creates the circle for the projectile being shot
    ctx.fillStyle = this.color // Colors the inside of the projectile to match player color
    ctx.fill()
    ctx.restore()
  }

  update() {
    this.draw()
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
  }
}
