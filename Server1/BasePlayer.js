// ------------------------------
// BasePlayer Class (Abstract)
// ------------------------------
class BasePlayer {
  /**
   * Constructor for the BasePlayer class.
   * @param {string} username - The player's name.
   * @param {number} x - The player's initial x-coordinate.
   * @param {number} y - The player's initial y-coordinate.
   * @param {number} [sequenceNumber=0] - The last processed input sequence number.
   * @param {number} [score=0] - The player's current score.
   */
  constructor({ username, x, y, sequenceNumber = 0, score = 0 }) {
      this.username = username // Player's display name
      this.x = x // X position on the map
      this.y = y // Y position on the map
      this.sequenceNumber = sequenceNumber // Tracks last processed movement input
      this.score = score // Player's current score

      // Default properties (these will be overridden by subclasses)
      this.radius = 0 // Player's hit box radius (set by subclasses)
      this.health = 0 // Current health (set by subclasses)
      this.maxHealth = 0 // Maximum health value (set by subclasses)
      this.speed = 0 // Movement speed (set by subclasses)
  }
}

module.exports = BasePlayer // Exports the class for use in other files
