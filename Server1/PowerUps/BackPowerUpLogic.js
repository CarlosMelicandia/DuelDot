// ------------------------------
// Power-up Spawner Logic
// ------------------------------

const { MultiShot, Speed, Health, Damage, Shield } = require("./BackPowerUps");

const GAME_WIDTH = 1024 // Default width
const GAME_HEIGHT = 576 // Default height
let powerUpId = 0; // Unique ID counter for power-ups



let spawning = true; // Use a global flag to control spawning

function spawnPowerUps(backEndPowerUps, io) {
    const maxX = GAME_WIDTH - 50;
    const maxY = GAME_HEIGHT - 50;
    const min = 50;

    const interval = setInterval(() => {
        // Stop spawning entirely if the limit is reached
        if (backEndPowerUps.length >= 15) {
            console.log("Powerup limit reached. Stopping spawning process.");
            spawning = false;
            clearInterval(interval); // Stop setInterval
            return;
        }

        // Spawning logic when allowed
        let spawnX = Math.random() * (maxX - min) + min;
        let spawnY = Math.random() * (maxY - min) + min;

        const powerUpTypes = ["speed", "multiShot", "health", "damage", "shield"];
        let powerUpType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];

        let newPowerUpId = powerUpId++; // Generate unique ID

        let powerUpData = {
            id: newPowerUpId,
            x: spawnX,
            y: spawnY,
            radius: 22,
            type: powerUpType,
        };

        // Add new powerup
        backEndPowerUps.push(powerUpData);
        console.log(`Spawning powerup: ID=${newPowerUpId}, Type=${powerUpType}`);

        // Notify clients
        io.emit("updatePowerUps", backEndPowerUps, powerUpData);
    }, 3000); // Slowing down spawn interval
}

// ------------------------------
// Power-up Collision Logic
// ------------------------------
function checkPowerUpCollision(backEndPowerUps, io, player) {
  for (let i = backEndPowerUps.length - 1; i >= 0; i--) {
      let powerUp = backEndPowerUps[i];
      let dist = Math.hypot(player.x - powerUp.x, player.y - powerUp.y);

      if (dist < player.radius + powerUp.radius) { // Collision detected
          const powerUpClasses = {
              speed: Speed,
              multiShot: MultiShot,
              health: Health,
              damage: Damage,
              shield: Shield,
          };
          const PowerUpClass = powerUpClasses[powerUp.type];

          if (PowerUpClass) {
              console.log(`Collision detected for PowerUp ID=${powerUp.id}, Type=${powerUp.type}`);
              
              // Apply powerup effects
              const powerUpInstance = new PowerUpClass(player, powerUp.id);
              powerUpInstance.apply();

              // Remove powerup from backend and notify frontend
              backEndPowerUps.splice(i, 1);
              io.emit("removePowerUp", { id: powerUp.id, remove: true });
              console.log(`PowerUp ID=${powerUp.id} removed from backend and emitted to frontend.`);

              // Check if spawning should restart
              if (backEndPowerUps.length < 10 && !spawning) {
                  console.log("Powerup count below limit. Restarting spawn process.");
                  spawning = true;
                  spawnPowerUps(backEndPowerUps, io); // Restart spawning
              }
          }
      }
  }
}
     

// Modify the projectile collision handler to account for shield and damage multipliers
function handleProjectileCollision(projectile, targetPlayer, shooterId) {
  // Find the shooter player
  const shooter = backEndPlayers[shooterId];
  
  if (!shooter) return 0; // Return if shooter doesn't exist
  
  const equippedWeapon = shooter.equippedWeapon;
  
  if (!equippedWeapon) return 0; // Return if no weapon equipped
  
  const weaponMtps = {
    light: shooter.lightWpnMtp,
    heavy: shooter.heavyWpnMtp,
    magic: shooter.MagicWpnMtp
  };
  
  const weaponMtp = weaponMtps[equippedWeapon.type] || 1;
  
  // Apply damage multiplier from powerup
  const damageMultiplier = shooter.damageMultiplier || 1;
  
  // Calculate total damage
  let totalDamage = equippedWeapon.damage * weaponMtp * damageMultiplier;
  
  // Apply damage considering shield
  if (targetPlayer.shieldAmount > 0) {
    if (totalDamage <= targetPlayer.shieldAmount) {
      targetPlayer.shieldAmount -= totalDamage;
      totalDamage = 0; // Shield absorbed all damage
    } else {
      totalDamage -= targetPlayer.shieldAmount; // Shield absorbed part of damage
      targetPlayer.shieldAmount = 0;
    }
  }
  
  // Only apply damage to health if there's any left after shield
  if (totalDamage > 0) {
    targetPlayer.health -= totalDamage;
  }
  
  return totalDamage;
}

module.exports = { 
  spawnPowerUps, 
  checkPowerUpCollision  ,
  handleProjectileCollision
};