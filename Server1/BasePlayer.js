class BasePlayer {
    constructor({username: username, x: x, y: y, sequenceNumber: sequenceNumber = 0, score: score = 0}) {
        this.username = username
        this.x = x
        this.y = y
        this.sequenceNumber = sequenceNumber
        this.score = score
        this.radius = 0
        this.health = 0
        this.maxHealth = 0
        this.speed = 0
      }
}

module.exports = BasePlayer