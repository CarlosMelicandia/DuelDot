class PowerUp {
  constructor({ x, y, type, id }) {
    this.x = x;
    this.y = y;
    this.id = id;
    this.type = type;
    this.radius = 8;
    this.color = type === 'speed' ? 'yellow' : 'green';
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }

  checkCollision(player) {
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < this.radius + player.radius; // Collision occurs if the distance is smaller than the sum of the radii
  }
}
