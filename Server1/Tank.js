const BasePlayer = require('./BasePlayer.js')

class Tank extends BasePlayer {
    constructor (props) {
        super(props)
        this.class = "Tank"
        this.health = 150
        this.maxHealth = 150
        this.radius = 17
        this.color = 'red'
        this.speed = .5
    }
}

module.exports = Tank