class Weapon{
    constructor({ name, type, damage, fireRate, velocity}){
        this.name = name
        this.type = type
        this.damage = damage
        this.fireRate = fireRate
        this.velocity = velocity
        this.isReloaded = true
    }
}

class Pistol extends Weapon{
    constructor(){
        super({
            name: "pistol", 
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
            "submachineGun",
            type: "light",
            damage: 10,
            fireRate: .5,
            velocity: 5});
    }
    
}
class Sniper extends Weapon{
    constructor(){
        super({
            name:"sniper",
            type: "heavy",
            damage: 50,
            fireRate: 4,
            velocity: 10});
    }
    
}
class Shuriken extends Weapon{
    constructor(){
        super({
            name: "shuriken",
            type: "light",
            damage: 25,
            fireRate: 1.2,
            velocity: 5});
    }
}

class Fist extends Weapon{
    constructor(){
        super({
            name: "fist",
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




