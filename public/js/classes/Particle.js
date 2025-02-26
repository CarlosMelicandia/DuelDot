const friction = 0.99
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.alpha = 1
  }

  draw() {
    ctx.save()
    ctx.globalAlpha = this.alpha // Transparency of the particle (0.0 to 1.0)
    ctx.beginPath() // Clears the path so that the new shape isn't connected to the previous one
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false) // Creates the circle for the particle
    ctx.fillStyle = this.color 
    ctx.fill()
    ctx.restore()
  }

  update() {
    this.draw()
    this.velocity.x *= friction
    this.velocity.y *= friction
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
    this.alpha -= 0.01
  }
}
