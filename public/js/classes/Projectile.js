
/** 
* Represents a projectile that a player shoots.
* Handles both rendering the projectile and updating its position.
*/
class Projectile {
  /**
   * Constructor for the projectile.
   * @param {number} x - The initial x-coordinate of the projectile.
   * @param {number} y - The initial y-coordinate of the projectile.
   * @param {number} radius - The radius of the projectile (size).
   * @param {string} color - The color of the projectile (defaults to white).
   * @param {Object} velocity - The velocity object, containing `x` and `y` components.
   */
  constructor({ x, y, radius, color = 'white', velocity }) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
  }

  /**
   * Draws the projectile onto the canvas.
   * - Saves the canvas state before applying effects.
   * - Applies a glowing effect using shadowBlur.
   * - Creates and fills a circle representing the projectile.
   * - Restores the canvas state to avoid affecting other elements.
   */
  draw() {
    c.save() // Save the current canvas state
    c.shadowColor = this.color // Apply a glowing effect matching the projectile's color
    c.shadowBlur = 20 // Determines the intensity of the glow effect
    c.beginPath() // Clears any existing path before drawing a new shape
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false) // Draws a circular projectile
    c.fillStyle = this.color // Set the projectile's color
    c.fill() // Fill the circle with color
    c.restore() // Restore the previous canvas state
  }

  /**
   * Updates the projectile's position based on its velocity.
   */
  update() {
    this.draw() // Redraws the projectile at its new position
    this.x += this.velocity.x // Moves the projectile horizontally
    this.y += this.velocity.y // Moves the projectile vertically
  }
}
