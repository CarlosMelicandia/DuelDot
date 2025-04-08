class Weapon{
    constructor({ name, type, damage, fireRate, velocity, imagePath }){
        this.name = name
        this.type = type
        this.damage = damage
        this.fireRate = fireRate
        this.velocity = velocity
        this.imagePath = imagePath
        this.isDropped = false
    }
}

class Pistol extends Weapon{
    constructor(){
        super({
            name: "pistol", 
            type: "light",
            damage: 20,
            fireRate: 1,
            velocity: 5,
            imagePath: "../assets/topDownWeapons/subgunTop.png"});
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
            velocity: 5,
            imagePath: "../assets/topDownWeapons/pistolTop.png"});
    }
    
}
class Sniper extends Weapon{
    constructor(){
        super({
            name:"sniper",
            type: "heavy",
            damage: 50,
            fireRate: 4,
            velocity: 10,
            imagePath: "../assets/topDownWeapons/sniperTop.png"});
    }
    
}
class Shuriken extends Weapon{
    constructor(){
        super({
            name: "shuriken",
            type: "light",
            damage: 25,
            fireRate: 1.2,
            velocity: 5,
            imagePath: "../assets/topDownWeapons/shurikenTop.png"});
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




