class Weapon{
    constructor(name, type, damage, fireRate, velocity){
        this.name = name
        this.type = type;
        this.damage = damage;
        this.fireRate = fireRate
        this.velocity = velocity;
    }
}

class Pistol extends Weapon{
    constructor(){
        super("Pistol", "light", 20, 1, 5);
    }
    
}
class SubmachineGun extends Weapon{
    constructor(){
        super("Submachine Gun","light", 10, .5, 5);
    }
    
}
class Sniper extends Weapon{
    constructor(){
        super("Sniper","heavy", 50, 4, 10);
    }
    
}
class Shuriken extends Weapon{
    constructor(){
        super("Shuriken", "light", 25, 1.2, 5);
    }
}

class Fist extends Weapon{
    constructor(){
        super("Fist", "melee", 40, 0.3, 5);
    }
}

module.exports = {
    Weapon,
    Pistol,
    SubmachineGun,
    Sniper,
    Shuriken,
    Fist
}