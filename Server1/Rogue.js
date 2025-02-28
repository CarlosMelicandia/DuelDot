const BasePlayer = require('./BasePlayer.js')

class Rogue extends BasePlayer {
    constructor (props) {
        super(props)
        this.class = "Rogue"
        this.health = 80
        this.maxHealth = 80
        this.radius = 9
        this.color = 'blue'
        this.speed = 1.4
    }
}

module.exports = Rogue