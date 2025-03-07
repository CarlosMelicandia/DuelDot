
/** Represents a player in the game. Each player has:
 * - A position (`x`, `y`)
 * - A visual representation (a colored circle)
 * - A username displayed above them
 * - Health and a health bar (Test branch addition)
 * - Speed (Test branch addition)
 */
class Player {
  /**
   * Constructor for the Player.
   * @param {number} x - The initial x-coordinate of the player.
   * @param {number} y - The initial y-coordinate of the player.
   * @param {number} radius - The radius of the player (size).
   * @param {string} color - The color of the player.
   * @param {string} username - The player's displayed username.
   * @param {number} health - The player's initial health (Test branch addition).
   * @param {number} speed - The player's movement speed (Test branch addition).
   */
  constructor({ x, y, radius, color, username, health, fireRate }) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.username = username
    this.health = health // Initialize health 
    this.maxHealth = health // Store max health for calculations 
    this.fireRate =  fireRate
  }

  /**
   * Draws the player onto the canvas.
   * - Displays the username centered below the player.
   * - Draws a circular representation of the player.
   * - Adds a glowing effect to enhance visibility.
   * - Renders a health bar above the player.
   */
  draw() {
    // ------------------------------
    // Draw Player's Username
    // ------------------------------
    c.font = '12px sans-serif'
    c.fillStyle = 'white' // Sets the color of the name text

    // Measure text width to center the username below the player
    const textWidth = c.measureText(this.username).width
    const textX = this.x - textWidth / 2 // Centers text horizontally
    const textY = this.y + this.radius + 15 // Places text below the player
    
    c.fillText(this.username, textX, textY) // Draw username

    // ------------------------------
    // Draw Player's Health Bar
    // ------------------------------
    const healthBarWidth = 40
    const healthBarHeight = 4
    const healthPercentage = this.health / this.maxHealth // Calculate remaining health

    // Health bar background (fixed width, slightly transparent)
    c.fillStyle = 'rgba(255, 255, 255, 0.5)'
    c.fillRect(
      this.x - healthBarWidth / 2, // Center it horizontally
      this.y - this.radius - 10, // Position it above the player
      healthBarWidth,
      healthBarHeight
    )

    // Health bar fill - color shifts from green to red based on remaining health
    const healthColor = `hsl(${healthPercentage * 120}, 100%, 50%)` // Green (full) → Red (low)
    c.fillStyle = healthColor
    c.fillRect(
      this.x - healthBarWidth / 2, // Keep aligned with background
      this.y - this.radius - 10, // Same Y position
      healthBarWidth * healthPercentage, // Shrinks as health decreases
      healthBarHeight
    )

    // ------------------------------
    // Draw Player's Body
    // ------------------------------
    c.save() // Save the current canvas state
    c.shadowColor = this.color // Apply a glow effect with the player's color
    c.shadowBlur = 20 // Defines the glow intensity
    c.beginPath() // Clears previous path so the circle isn't connected to older shapes
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false) // Draws the player as a circle
    c.fillStyle = this.color // Colors the circle to match the player's assigned color
    c.fill() // Fills the shape with the chosen color
    c.restore() // Restores the canvas state to avoid affecting other elements
  }
}
