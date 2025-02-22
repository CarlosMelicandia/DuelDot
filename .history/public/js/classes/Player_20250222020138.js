class Player {
  constructor(x, y) {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.radius = 10
    this.color = 'white'
    this.health = 100
    healthEl.innerHTML = this.health
    this.speed = 1
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
  }
}
