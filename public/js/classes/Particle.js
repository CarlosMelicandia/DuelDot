/**
 * ------------------------------
 * Particle Class
 * ------------------------------
 * Represents a small fading effect that occurs when a projectile collides
 * or an explosion effect is needed.
 * 
 * - Each particle has:
 *   - A position (`x`, `y`)
 *   - A small radius (size)
 *   - A velocity that slows over time (friction applied)
 *   - A fading effect (`alpha` gradually decreases)
 * 
 * - The particles disappear as `alpha` approaches 0.
 */

// Global friction constant that gradually slows particle movement.
const friction = 0.99 

class Particle {
  /**
   * Constructor for the Particle.
   * @param {number} x - The initial x-coordinate of the particle.
   * @param {number} y - The initial y-coordinate of the particle.
   * @param {number} radius - The radius of the particle (size).
   * @param {string} color - The color of the particle.
   * @param {Object} velocity - The velocity object, containing `x` and `y` components.
   */
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.alpha = 1 // Alpha determines opacity, starts at fully visible (1)
  }

 // ------------------------------
  // Draws the particle in the Client
  // ------------------------------
  draw() {
    c.save() // Save the current canvas state
    c.globalAlpha = this.alpha // Set transparency based on the particle's lifespan
    c.beginPath() // Clears any existing path before drawing a new shape
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false) // Draws the particle as a circle
    c.fillStyle = this.color // Set the particle's color
    c.fill() // Fill the circle with the specified color
    c.restore() // Restore the previous canvas state
  }

  // ------------------------------
  // Updates the particle in the Client
  // ------------------------------
  update() {
    this.draw() // Draws the particle in its new position

    // Apply friction to gradually slow the particle down
    this.velocity.x *= friction
    this.velocity.y *= friction

    // Move the particle
    this.x += this.velocity.x
    this.y += this.velocity.y

    // Reduce alpha (transparency) over time, causing the particle to fade out
    this.alpha -= 0.01 
  }
}
