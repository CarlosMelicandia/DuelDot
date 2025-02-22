class Enemy {
  constructor(x, y, radius, color, velocity, health) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity; // Initial velocity from spawnEnemies()
    this.health = health;
    this.trackingDelay = 50; // Frames before switching to tracking (adjust as needed)
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
  }

  moveToPlayer() {
    const enemySpeed = 1;
    let directionX = player.x - this.x;
    let directionY = player.y - this.y;
    let magnitude = Math.sqrt(directionX ** 2 + directionY ** 2);

    if (magnitude > 0) { // Prevent division by zero
      let normalizedX = directionX / magnitude;
      let normalizedY = directionY / magnitude;
      this.x += normalizedX * enemySpeed;
      this.y += normalizedY * enemySpeed;
    }
  }

  update() {
    this.draw();
    
    if (this.trackingDelay > 0) {
      // Move using initial velocity for a few frames
      this.x += this.velocity.x;
      this.y += this.velocity.y;
      this.trackingDelay--; // Countdown before switching to player tracking
    } else {
      // After delay, switch to tracking player
      this.moveToPlayer();
    }
  }
}
