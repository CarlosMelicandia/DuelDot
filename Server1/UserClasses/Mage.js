const BasePlayer = require('./BasePlayer.js')

/**
 * This class represents the Rogue player type.
 * Rogues have high speed but lower health and a small hitbox.
 */
class Mage extends BasePlayer {
    /**
     * Constructor for the Rogue class.
     * @param {Object} props - The configuration object for the player.
     */
    constructor(props) {
        super(props) // Calls BasePlayer constructor
        this.class = "Mage" 

        // Class Stats
        this.health = 120
        this.maxHealth = 100
        this.radius = 12 
        this.color = 'purple' 
        this.speed = 1

        // Weapon multipliers
        this.lightWpnMtp = 1.0
        this.heavyWpnMtp = 0.8
        this.magicWpnMtp = 1.5

        // Ability tracking
        this.lastHealTime = 0
    }

    attemptHeal() {
        const now = Date.now()
        const cooldown = 20000 // 20 seconds

        if (now - this.lastHealTime < cooldown) return

        this.lastHealTime = now
        this.health = Math.min(this.health + 25, this.maxHealth)
    }
}

module.exports = Mage // Exports the class for use in other files
//