/* 
This is the Tank Class
*/
class Tank extends Player{
    constructor (x, y) {
        super(x, y)
        this.radius = 15
        this.color = 'red'
        this.speed = .50;
        this.health = 150;
    }
}


