class Weapon{
    constructor({ name, type, damage, fireRate, velocity }){
        this.name = name
        this.type = type
        this.damage = damage
        this.fireRate = fireRate
        this.velocity = velocity
        this.isDropped = false
    }
}

class Pistol extends Weapon{
    constructor(){
        super({
            name: "Pistol", 
            type: "light",
            damage: 20,
            fireRate: 1,
            velocity: 5});
    }
    
}
class SubmachineGun extends Weapon{
    constructor(){
        super({
            name:
            "Submachine Gun",
            type: "light",
            damage: 10,
            fireRate: .5,
            velocity: 5});
    }
    
}
class Sniper extends Weapon{
    constructor(){
        super({
            name:"Sniper",
            type: "heavy",
            damage: 50,
            fireRate: 4,
            velocity: 10});
    }
    
}
class Shuriken extends Weapon{
    constructor(){
        super({
            name: "Shuriken",
            type: "light",
            damage: 25,
            fireRate: 1.2,
            velocity: 5});
    }
}

class Fist extends Weapon{
    constructor(){
        super({
            name: "Fist",
            type: "melee",
            damage: 40,
            fireRate: 0.3,
            velocity: 5});
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