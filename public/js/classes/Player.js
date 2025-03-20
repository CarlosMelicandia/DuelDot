
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
  constructor({ x, y, radius, color, username, health, speed, canShoot, equippedWeapon }) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.username = username
    this.health = health // Initialize health 
    this.maxHealth = health // Store max health for calculations 
    this.speed = speed // Movement speed 
    this.canShoot = canShoot
    this.equippedWeapon = equippedWeapon

    this.aimAngle = 0
    this.handXMove = 0
  }

  /**
   * Draws the player onto the canvas.
   * - Displays the username centered below the player.
   * - Draws a circular representation of the player.
   * - Adds a glowing effect to enhance visibility.
   * - Renders a health bar above the player.
   */
  draw({ xPosition = 1.5, yPosition = 10, angle }) {
    // --- Draw Username ---
    c.font = '12px sans-serif'
    c.fillStyle = 'white'
    const textWidth = c.measureText(this.username).width
    const textX = this.x - textWidth / 2
    const textY = this.y + this.radius + 15
    c.fillText(this.username, textX, textY)
  
    // --- Draw Health Bar ---
    const healthBarWidth = 40
    const healthBarHeight = 4
    const healthPercentage = this.health / this.maxHealth
  
    c.fillStyle = 'rgba(255, 255, 255, 0.5)'
    c.fillRect(this.x - healthBarWidth / 2, this.y - this.radius - 10, healthBarWidth, healthBarHeight)
  
    const healthColor = `hsl(${healthPercentage * 120}, 100%, 50%)`
    c.fillStyle = healthColor
    c.fillRect(this.x - healthBarWidth / 2, this.y - this.radius - 10, healthBarWidth * healthPercentage, healthBarHeight)
  
    // 
    // Draw Player's Body
    // 
    c.save()
    c.translate(this.x, this.y)
    c.rotate(this.aimAngle)
  
    // Body
    c.shadowColor = this.color
    c.shadowBlur = 20
    c.beginPath()
    c.fillStyle = this.color
    c.arc(0, 0, this.radius, 0, Math.PI * 2) // << draw from center now
    c.fill()
  
    // Draw facing indicator – optional: pointer or "eye"
    c.beginPath()
    c.fillStyle = 'black'
    c.arc(this.radius * 0.7, 0, this.radius * 0.2, 0, Math.PI * 2) // a small "eye" or dot to show direction
    c.fill()
  
    // Draw hand
    c.beginPath()
    c.fillStyle = this.color
    c.arc(this.radius * xPosition, yPosition, this.radius / 3, 0, Math.PI * 2)
    c.arc(this.radius * xPosition, -yPosition, this.radius / 3, 0, Math.PI * 2)
    c.fill()
  
    c.restore()
  }
}