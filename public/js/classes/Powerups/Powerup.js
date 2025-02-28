class PowerUp {
  constructor({ x, y, type, id }) {
    this.x = x;
    this.y = y;
    this.id = id;
    this.type = type;
    this.radius = 8;
    this.color = type === 'speed' ? 'blue' : 'green';
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
}
