/* 
This is the Mage Class
*/
class Mage extends Player {
    constructor(x, y) {
        super(x, y)
        this.radius = 10
        this.color = 'blue'
        this.speed = 1.10;
        this.health = 80;
    }
}
