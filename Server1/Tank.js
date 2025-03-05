const BasePlayer = require('./BasePlayer.js')

/**
 * This class represents the Tank player type.
 * Tanks have very high health but are slow and have a large hitbox.
 */
class Tank extends BasePlayer {
    /**
     * Constructor for the Tank class.
     * @param {Object} props - The configuration object for the player.
     */
    constructor(props) {
        super(props) // Calls BasePlayer constructor
        this.class = "Tank"
        
        // Class Stats
        this.health = 150
        this.maxHealth = 150
        this.radius = 17
        this.color = 'red'
        this.speed = .5

        // Weapon multipliers
        this.lightWpnMtp = 1.0
        this.heavyWpnMtp = 1.0
        this.magicWpnMtp = 1.0
    }
}

module.exports = Tank // Exports the class for use in other files