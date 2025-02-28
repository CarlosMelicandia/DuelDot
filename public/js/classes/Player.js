class Player {
  constructor({ x, y, radius, color, username, health , speed }) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.username = username
    this.health = health // Initialize with 100 health
    this.maxHealth = health // Store max health for calculations
    this.speed = speed
  }

  draw() {
    c.font = '12px sans-serif'
    c.fillStyle = 'white'
    const textWidth = c.measureText(this.username).width;
    // Center the text under the player
    const textX = this.x - textWidth / 2;
    const textY = this.y + this.radius + 15;
    
    c.fillText(this.username, textX, textY);

    // Draw health bar
    const healthBarWidth = 40
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
