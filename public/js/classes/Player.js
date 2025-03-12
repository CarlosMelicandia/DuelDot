class Player {
  constructor({ x, y, radius, color, username }) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.username = username 
    this.activePowerUps = {}
  }

  draw() {
    ctx.font = '12px sans-serif'
    ctx.fillStyle = 'white' // sets the color of the name
    ctx.fillText(this.username, this.x - 10, this.y + 20) // Tracks player position to adjust name position
    ctx.save()
    ctx.shadowColor = this.color // outside shadow of the player (gives a glowy look to the player)
    ctx.shadowBlur = 20 // How big the glowy look is going to be
    ctx.beginPath() // Clears the path so that the new shape isn't connected to the previous one
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false) // Creates the circle for the player
    ctx.fillStyle = this.color // Colors the inside of the player to match player color
    ctx.fill() // Draws the actual circle of the player
    ctx.restore()
  }
}
