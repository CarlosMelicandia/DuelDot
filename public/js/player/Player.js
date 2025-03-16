class Player {
  constructor ({x, y, radius, color, username, health, peed, score}) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.username = username
    this.health = health
    this.speed = speed
    this.score = score
  }

  draw(c) {
    // Draw the player circle at its world position.
    c.save();
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = this.color;
    c.fill();
    c.restore();

    // Draw the username below the player.
    c.font = "12px sans-serif";
    c.fillStyle = "white";
    const textWidth = c.measureText(this.username).width;
    c.fillText(this.username, this.x - textWidth / 2, this.y + this.radius + 15);
  }
}