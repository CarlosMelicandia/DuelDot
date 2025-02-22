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
    let directionToMoveX = player.x - this.x // Detects the direction the enemy should move
    let directionToMoveY = player.y - this.y // Detects the direction the enemy should move
    let moving = Math.sqrt(Math.pow(directionToMoveX, 2) + Math.pow(directionToMoveY, 2))
    console.log(moving)
  }

  update() {
    this.draw()
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
    this.moveToPlayer()
  }
}