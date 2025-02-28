const BasePlayer = require('./BasePlayer.js')

class Mage extends BasePlayer{
    constructor (props) {
        super(props)
        this.class = "Mage"
        this.health = 100
        this.maxHealth = 100
        this.radius = 10
        this.color = 'purple'
        this.speed = 1.2
    }
}

module.exports = Mage