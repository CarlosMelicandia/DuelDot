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
        this.class = "Rogue" 

        // Class Stats
        this.health = 80 
        this.maxHealth = 80 
        this.radius = 9 
        this.color = 'blue' 
        this.speed = 1.4 

        // Weapon multipliers
        this.lightWpnMtp = 1.0
        this.heavyWpnMtp = 1.0
        this.magicWpnMtp = 1.0
    }
}

module.exports = Mage // Exports the class for use in other files
