const BasePlayer = require('./BasePlayer.js')

/**
 * This class represents the Gunner player type.
 * Gunners have moderate health, speed, and a larger hitbox.
 */
class Gunner extends BasePlayer {
    /**
     * Constructor for the Gunner class.
     * @param {Object} props - The configuration object for the player.
     */
    constructor(props) {
        super(props) // Calls BasePlayer constructor
        this.class = "Gunner"
        
        // Class Stats
        this.health = 100
        this.maxHealth = 100
        this.radius = 14
        this.color = 'grey' 
        this.speed = 1.2 

        // Weapon multipliers
        this.lightWpnMtp = 1.3
        this.heavyWpnMtp = 1.3
        this.magicWpnMtp = 0.7

        this.inventory = [null, null, null] 
    }
}

module.exports = Gunner // Exports the class for use in other files
//