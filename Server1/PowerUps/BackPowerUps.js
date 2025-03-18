class PowerUp {
    constructor({ name, type, duration, player }){
        this.name = name
        this.type = type
        this.duration = duration // in ms
        this.player = player
    }

    apply(){

    }

    removalEffect(){

    }
}

class Speed extends PowerUp{
    constructor(){
        super ("SpeedUp", "Speed", 5000)
    }

    apply(){
        this.player.player = this.player.originalSpeed * 1.8
        this.player.hasPowerUp = true
        this.player.activePowerups = true
    }
}

class MultiShot extends PowerUp{
    
}

class Health extends PowerUp{
    
}

class Damage extends PowerUp{
    
}

class Shield extends PowerUp{
    
}