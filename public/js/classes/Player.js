class Player {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.radius = 10
    this.color = 'white'
    this.speed = 1
    this.health = 100
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
  }
}
