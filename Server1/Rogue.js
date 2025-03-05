const BasePlayer = require('./BasePlayer.js')

class Rogue extends BasePlayer {
    constructor (props) {
        super(props)
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

module.exports = Rogue