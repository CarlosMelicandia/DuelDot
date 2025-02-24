class SpeedUpgrade {
    constructor(x, y) {
      this.x = x
      this.y = y
      this.width = 15
      this.height = 15
      this.color = 'purple'
    }
  
    draw() {
      c.beginPath()
      c.fillRect(this.x, this.y, this.height, this.width)
      c.fill()
    }
  
    isCollided() {
      const dist = Math.hypot(player.x - this.x, player.y - this.y)
      if (dist - player.radius - (this.width + this.height) < 1) {
        player.speed *= 1.05
        return true
      }
      return false
    }
  
    update() {
      this.draw()
    }
  }
  