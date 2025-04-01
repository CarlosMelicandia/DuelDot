// PowerUps.js
class PowerUp {
    constructor(name, type, duration, player, id) {
        this.name = name;
        this.type = type;
        this.duration = duration; // in ms
        this.player = player;
        this.activePowerups = {};
        this.id = id;
        console.log(`PowerUp created: ID=${this.id}, Type=${this.type}, Duration=${this.duration}`);

    }
}

class Speed extends PowerUp {
    constructor(player, id) {
        super("SpeedUp", "speed", 5000, player, id);
        this.speedMultiplier = 1.8;
    }

    apply() {
        if (!this.player.originalSpeed) this.player.originalSpeed = this.player.speed;
          this.player.speed = this.player.originalSpeed * 1.8; // Increase speed
          
          // Store powerup info to display the aura
          this.player.activePowerups = this.player.activePowerups || {};
          this.player.activePowerups.speed = {
            active: true,
            endTime: Date.now() + this.duration
          };
          setTimeout(() => {  console.log(`Scheduled removalEffect for PowerUp ID=${this.id}, Type=${this.type} after ${this.duration} ms`);
            this.removalEffect()
        },   this.duration);
    }

    removalEffect() {
        console.log("speed effect removed.");

        this.player.speed = this.player.originalSpeed;
        if (this.player.activePowerups && this.player.activePowerups.speed) {
            this.player.activePowerups.speed.active = false;
          }
    }
}

class MultiShot extends PowerUp {
    constructor(player, id) {
        super("MultiShot", "multiShot", 5000, player, id);
    }

    apply() {
        this.player.hasMultiShot = true;
          
        // Store powerup info to display the aura
        this.player.activePowerups = this.player.activePowerups || {};
        this.player.activePowerups.multiShot = {
          active: true,
          endTime: Date.now() + this.duration
        };

        setTimeout(() => {console.log(`Scheduled removalEffect for PowerUp ID=${this.id}, Type=${this.type} after ${this.duration} ms`);
            this.removalEffect()
        },   this.duration);
    }

    removalEffect() {
        console.log("MultiShot effect removed.");

        this.player.hasMultiShot = false;
              
              if (this.player.activePowerups && this.player.activePowerups.multiShot) {
                this.player.activePowerups.multiShot.active = false;
              }
    }
}

class Health extends PowerUp {
    constructor(player, id) {
        super("Health", "health", 5000, player, id);
        this.healthBoost = 0.35;
    }

    apply() {
        this.player.health = Math.min(
            this.player.maxHealth,
            this.player.health + this.player.maxHealth * this.healthBoost
        );

        this.player.activePowerups = this.player.activePowerups || {};
          this.player.activePowerups.health = {
            active: true,
            endTime: Date.now() + 1000 // Show effect briefly
        };

        setTimeout(() => {  console.log(`Scheduled removalEffect for PowerUp ID=${this.id}, Type=${this.type} after ${this.duration} ms`);
            this.removalEffect()
        },  1000);
    }

    removalEffect(){
        console.log("health effect removed.");

        if (this.player && this.player.activePowerups && this.player.activePowerups.health) {
            this.player.activePowerups.health.active = false;
          }
    }
}

class Damage extends PowerUp {
    constructor(player, id) {
        super("Damage", "damage", 5000, player, id);
        this.damageMultiplier = 2;
    }

    apply() {
        this.player.damageMultiplier = (this.player.damageMultiplier || 1) + this.damageMultiplier;
        this.player.activePowerups = this.player.activePowerups || {};
          this.player.activePowerups.damage = {
            active: true,
            endTime: Date.now() + this.duration
          };

          setTimeout(() => {  console.log(`Scheduled removalEffect for PowerUp ID=${this.id}, Type=${this.type} after ${this.duration} ms`);
            this.removalEffect()
        },   this.duration);
    }

    removalEffect() {
        console.log("damage effect removed.");

        this.player.damageMultiplier -= this.damageMultiplier;
        if (this.player.activePowerups && this.player.activePowerups.damage) {
            this.player.activePowerups.damage.active = false;
          }
    }
}

class Shield  extends PowerUp {
     constructor(player, id) {
           super("Shield ", "shield", 5000, player, id);
           this.shieldPoints = 50;
        }

     apply() {
         this.player.shield = (this.player.shield || 0) + this.shieldPoints;

         this.player.activePowerups = this.player.activePowerups || {};
         this.player.activePowerups.shield = {
               active: true,
              endTime: Date.now() + this.duration,
         };

         setTimeout(() => {  console.log(`Scheduled removalEffect for PowerUp ID=${this.id}, Type=${this.type} after ${this.duration} ms`);
         this.removalEffect()
     },   this.duration);
     }

     removalEffect(){}
}

class Rapid extends PowerUp {
    constructor(player, id) {
        super("Rapid", "rapid", 5000, player, id);

    }

    apply(){
        this.player.hasRapidFire = true;
        this.player.activePowerups = this.player.activePowerups || {};

        this.player.activePowerups.rapidFire = {
          active: true,
          endTime: Date.now() + this.duration
        };

        setTimeout(() => {  console.log(`Scheduled removalEffect for PowerUp ID=${this.id}, Type=${this.type} after ${this.duration} ms`);
        this.removalEffect()
    },   this.duration);

    }

    removalEffect(){
        if (this.player.activePowerups && this.player.activePowerups.rapidFire) {
            this.player.activePowerups.rapidFire.active = false;
          }
    }
}


// Exporting modules for use
module.exports = {
    Speed,
    MultiShot,
    Health,
    Damage,
    Shield ,
    Rapid ,
    PowerUp,
};