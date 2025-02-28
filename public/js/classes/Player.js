class Player {
  constructor({ x, y, radius, color, username, health = 100 }) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.username = username
    this.health = health // Initialize with 100 health
    this.maxHealth = 100 // Store max health for calculations
    this.speed = 1
  }

  draw() {
    c.font = '12px sans-serif'
    c.fillStyle = 'white'
    c.fillText(this.username, this.x - 10, this.y + 20)

    // Draw health bar
    const healthBarWidth = 30
    const healthBarHeight = 4
    const healthPercentage = this.health / this.maxHealth
    
    // Health bar background
    c.fillStyle = 'rgba(255, 255, 255, 0.5)'
    c.fillRect(
      this.x - healthBarWidth / 2,
      this.y - this.radius - 10,
      healthBarWidth,
      healthBarHeight
    )
    
    // Health bar fill - green to red gradient based on health
    const healthColor = `hsl(${healthPercentage * 120}, 100%, 50%)`
    c.fillStyle = healthColor
    c.fillRect(
      this.x - healthBarWidth / 2,
      this.y - this.radius - 10,
      healthBarWidth * healthPercentage,
      healthBarHeight
    )

    c.save()
    c.shadowColor = this.color
    c.shadowBlur = 20
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
    c.restore()
  }
}
