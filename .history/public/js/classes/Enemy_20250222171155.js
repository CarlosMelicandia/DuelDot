class Enemy {
  constructor(x, y, radius, color, velocity, health) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.health = health
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
  }

  moveToPlayer(){
    let directionX = player.x - this.x // Detects the direction the enemy should move
    let directionY = player.y - this.y // Detects the direction the enemy should move
    let magnitude = Math.sqrt(Math.pow(directionX, 2) + Math.pow(directionY, 2))
    let normalizedX = directionX / magnitude
    let normalizedY = directionY / magnitude
    this.x += normalizedX * this.velocity.x
    this.y += normalizedY * this.velocity.y
  }

  update() {
    this.draw()
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
    this.moveToPlayer()
  }
}