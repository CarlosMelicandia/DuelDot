class Weapon{
    constructor(type, damage, velocity){
        this.type = type;
        this.damage = damage;
        this.velocity = velocity;
    }
}

class Pistol extends Weapon{
    constructor(){
        super("light",20,5);
    }
    
}
class SubmachineGun extends Weapon{
    constructor(){
        super("light",10,5);
    }
    
}
class Sniper extends Weapon{
    constructor(){
        super("heavy",50,10);
    }
    
}
class Shuriken extends Weapon{
    constructor(){
        super("light",25,5);
    }
    
}

module.exports = {
    Weapon,
    Pistol,
    SubmachineGun,
    Sniper,
    Shuriken
}