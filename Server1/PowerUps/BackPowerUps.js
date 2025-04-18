// ------------------------------
// Base PowerUp Class
// ------------------------------

class PowerUp {
    constructor(name, type, duration, player, id) {
        this.name = name; // Name of the powerup
        this.type = type; // Type identifier for the powerup
        this.duration = duration; // Duration in milliseconds
        this.player = player; // The player who picked up the powerup

        if (!this.player.activePowerups) {
            this.player.activePowerups = {};
        }

        this.id = id; // Unique ID for tracking
    }

    // Check if player can add another powerup (max 3)
    canApplyPowerup() {
        // Health powerups can always be applied
        if (this.type === "health") return true;
    
        const activePowerups = this.player.activePowerups || {};
    
        // Check if the same powerup type is already active and hasn't expired
        const existing = activePowerups[this.type];
        if (existing && existing.active && existing.endTime > Date.now()) {
            return false;
        }
    
        // Count other active powerups (excluding expired and health)
        const activeCount = Object.entries(activePowerups)
            .filter(([key, p]) => p.active && p.endTime > Date.now() && key !== "health")
            .length;
    
        return activeCount < 3;
    }
}

// ------------------------------
// Speed PowerUp - Increases Player Speed
// ------------------------------

class Speed extends PowerUp {
    constructor(player, id) {
        super("SpeedUp", "speed", 5000, player, id);
        this.speedMultiplier = 1.8; // Speed increase factor
    }

    apply() {
        // Check if player can have another powerup
        if (!this.canApplyPowerup()) return 

        // Save original speed if it hasn't been stored
        if (!this.player.originalSpeed) this.player.originalSpeed = this.player.speed;

        // Apply speed increase
        this.player.speed = this.player.originalSpeed * this.speedMultiplier;
        
        // Store powerup info for tracking
        this.player.activePowerups = this.player.activePowerups || {};
        this.player.activePowerups.speed = {
            active: true,
            endTime: Date.now() + this.duration
        };

        // Schedule powerup removal after its duration
        setTimeout(() => {
            this.removalEffect();
        }, this.duration);
    }

    removalEffect() {
       
        this.player.speed = this.player.originalSpeed;

        // Mark powerup as inactive
        if (this.player.activePowerups && this.player.activePowerups.speed) {
            this.player.activePowerups.speed.active = false;
        }
    }
}

// ------------------------------
// MultiShot PowerUp - Enables Multiple Shots at Once
// ------------------------------

class MultiShot extends PowerUp {
    constructor(player, id) {
        super("MultiShot", "multiShot", 3000, player, id);
    }

    apply() {
        // Check if player can have another powerup
        if (!this.canApplyPowerup()) return 
        

        this.player.hasMultiShot = true; // Enable multishot mode

        // Store powerup info for tracking
        this.player.activePowerups = this.player.activePowerups || {};
        this.player.activePowerups.multiShot = {
            active: true,
            endTime: Date.now() + this.duration
        };

        // Schedule powerup removal after duration
        setTimeout(() => {
            this.removalEffect();
        }, this.duration);
    }

    removalEffect() {
        
        this.player.hasMultiShot = false;

        if (this.player.activePowerups && this.player.activePowerups.multiShot) {
            this.player.activePowerups.multiShot.active = false;
        }
    }
}

// ------------------------------
// Health PowerUp - Restores Player Health
// ------------------------------

class Health extends PowerUp {
    constructor(player, id) {
        super("Health", "health", 1000, player, id);
        this.healthBoost = 0.35; // Restores 35% of max health
    }

    apply() {
        // Increase health, ensuring it doesn't exceed max health
        this.player.health = Math.min(
            this.player.maxHealth,
            this.player.health + this.player.maxHealth * this.healthBoost
        );

        // Store powerup info temporarily
        this.player.activePowerups = this.player.activePowerups || {};
        this.player.activePowerups.health = {
            active: true,
            endTime: Date.now() + 1000 // Effect shows briefly
        };

        // Schedule removal effect after 1 second
        setTimeout(() => {
            this.removalEffect();
        }, 1000);
    }

    removalEffect() {
       
        if (this.player && this.player.activePowerups && this.player.activePowerups.health) {
            this.player.activePowerups.health.active = false;
        }
    }
}

// ------------------------------
// Damage PowerUp - Increases Player Damage
// ------------------------------

class Damage extends PowerUp {
    constructor(player, id) {
        super("Damage", "damage", 5000, player, id);
        this.damageMultiplier = 2; // Doubles damage
    }

    apply() {
        // Check if player can have another powerup
        if (!this.canApplyPowerup()) return false; 

        // Apply damage multiplier
        this.player.damageMultiplier *= this.damageMultiplier

        // Store powerup info
        this.player.activePowerups.damage = {
            active: true,
            endTime: Date.now() + this.duration
        };

        // Schedule removal effect
        setTimeout(() => {
            this.removalEffect();
        }, this.duration);
    }

    removalEffect() {
        
        this.player.damageMultiplier /= this.damageMultiplier;

        if (this.player.activePowerups && this.player.activePowerups.damage) {
            this.player.activePowerups.damage.active = false;
        }
    }
}

// ------------------------------
// Shield PowerUp - Provides Protective Shield
// ------------------------------

class Shield extends PowerUp {
    constructor(player, id) {
        super("Shield", "shield", 6000, player, id);
        this.shieldPoints = 50; // Amount of shield points
    }

    apply() {
        // Check if player can have another powerup
        if (!this.canApplyPowerup()) return false

        if (typeof this.player.shieldAmount !== "number") {
            this.player.shieldAmount = 0;
          }
          

        this.player.shieldAmount += this.shieldPoints; // Add shield points

        // Store powerup info
        this.player.activePowerups = this.player.activePowerups || {};
        this.player.activePowerups.shield = {
            active: true,
            endTime: Date.now() + this.duration
        };

        // Schedule removal effect
        setTimeout(() => {
            this.removalEffect();
        }, this.duration);
    }

    removalEffect() {
    }
}

// ------------------------------
// Rapid Fire PowerUp - Increases Firing Rate
// ------------------------------

class Rapid extends PowerUp {
    constructor(player, id) {
        super("Rapid", "rapid", 3000, player, id);
    }

    apply() {
        // Check if player can have another powerup
        if (!this.canApplyPowerup()) return false

        this.player.hasRapidFire = true; // Enable rapid fire mode

        // Store powerup info
        this.player.activePowerups = this.player.activePowerups || {};
        this.player.activePowerups.rapidFire = {
            active: true,
            endTime: Date.now() + this.duration
        };

        // Schedule removal effect
        setTimeout(() => {
            this.removalEffect();
        }, this.duration);
    }

    removalEffect() {
        if (this.player.activePowerups && this.player.activePowerups.rapidFire) {
            this.player.hasRapidFire = false;
            this.player.activePowerups.rapidFire.active = false;
        }
    }
}

// ------------------------------
// Fire PowerUp - Enables Fire-Based Attack
// ------------------------------

class Fire extends PowerUp {
    constructor(player, id) {
        super("Fire", "fire", 5000, player, id);
    }

    apply() {
        // Check if player can have another powerup
        if (!this.canApplyPowerup()) return false

        this.player.hasFire = true; // Enable fire effect

        // Store powerup info
        this.player.activePowerups = this.player.activePowerups || {};
        this.player.activePowerups.fire = {
            active: true,
            endTime: Date.now() + this.duration
        };

        // Schedule removal effect
        setTimeout(() => {
            this.removalEffect();
        }, this.duration);
    }

    removalEffect() {
        this.player.hasFire = false;

        if (this.player.activePowerups && this.player.activePowerups.fire) {
            this.player.activePowerups.fire.active = false;
        }
    }
}

function getActivePowerupCount(player) {
    if (!player || !player.activePowerups) return 0;
    
    return Object.values(player.activePowerups)
        .filter(p => p.active && p.endTime > Date.now())
        .length;
}

// ------------------------------
// Export PowerUp Classes for Backend Use
// ------------------------------

module.exports = {
    Speed,
    MultiShot,
    Health,
    Damage,
    Shield,
    Rapid,
    Fire,
    PowerUp,
    getActivePowerupCount,
};