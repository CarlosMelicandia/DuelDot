const BasePlayer = require('./BasePlayer.js')

class Rogue extends BasePlayer {
    constructor (props) {
        super(props)
        this.class = "Rogue"

        // Class Stats
        this.health = 80
        this.maxHealth = 80
        this.radius = 12
        this.color = 'blue'
        this.speed = 1.4

        // Weapon multipliers
        this.lightWpnMtp = 1.4
        this.heavyWpnMtp = 0.5
        this.magicWpnMtp = 1.1


        this.baseSpeed = this.speed
        this.killSpeedMultiplier = 1
        this.powerupSpeedMultiplier = 1

        this.updateSpeed = function () {
            this.speed = this.baseSpeed * this.killSpeedMultiplier * this.powerupSpeedMultiplier
        }

    }
}

module.exports = Rogue
//