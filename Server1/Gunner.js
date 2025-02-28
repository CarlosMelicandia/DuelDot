const BasePlayer = require('./BasePlayer.js')

class Gunner extends BasePlayer {
    constructor (props) {
        super(props)
        this.class = "Gunner"
        this.health = 100
        this.maxHealth = 100
        this.radius = 14
        this.color = 'grey'
        this.speed = 1
    }
}

module.exports = Gunner