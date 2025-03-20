// ------------------------------
// BasePlayer Class (Abstract)
// ------------------------------
const { Fist } = require('./WeaponStuff/Weapons')
class BasePlayer {
  /**
   * Constructor for the BasePlayer class.
   * @param {string} username - The player's name.
   * @param {number} x - The player's initial x-coordinate.
   * @param {number} y - The player's initial y-coordinate.
   * @param {number} [sequenceNumber=0] - The last processed input sequence number.
   * @param {number} [score=0] - The player's current score.
   */
  constructor({ username, x, y, sequenceNumber = 0, score = 0, equippedWeapon }) {
      this.username = username // Player's display name
      this.x = x // X position on the map
      this.y = y // Y position on the map
      this.sequenceNumber = sequenceNumber // Tracks last processed movement input
      this.score = score // Player's current score

      // Power Properties
      this.hasMultiShot = false
      this.damageMultiplier = 1
      this.shieldAmount = 0
      this.hasPowerUp = false
      this.activePowerup = null
      this.originalSpeed = this.speed

      // Hand Properties
      this.handX = 1.5 
      this.handY = 10
      this.aimAngle = 0
      this.canPunch = true

      // Default properties
      this.health = 0
      this.maxHealth = 0
      this.radius = 0 // Player's hit box radius (set by subclasses)
      this.health = 0 // Current health (set by subclasses)
      this.maxHealth = 0 // Maximum health value (set by subclasses)
      this.speed = 0 // Movement speed (set by subclasses)

      // Default Weapon multipliers
      this.lightWpnMtp = 1.0
      this.heavyWpnMtp = 1.0
      this.magicWpnMtp = 1.0

      // Inventory and Equipped
      this.inventory = []
      this.equippedWeapon = equippedWeapon

      this.canShoot = true
  }
}

module.exports = BasePlayer // Exports the class for use in other files