/* 
This is the Tank Class
*/
class Tank extends Player{
    constructor (x, y, radius, color,shield, speed,health) {
        super(x, y)
        this.color = 'red'
        this.shield = shield;
        this.speed = .8;
    constructor (x, y) {
        super(x, y)
        this.radius = 15
        this.color = 'red'
        this.speed = .50;
        this.health = 150;
    }
}

class Mage extends Player{
    constructor(x,y){
        super(x, y)
        this.radius = 10
        this.color = 'blue'
        this.speed = 1.50;
        this.health = 80;
    }
}


