// ------------------------------
// Power-up Spawner Logic
// ------------------------------

const { MultiShot, Speed, Health, Damage, Shield, Rapid, Fire} = require("./BackPowerUps");

const GAME_WIDTH = 5000 // Default width
const GAME_HEIGHT = 5000 // Default height
let powerUpId = 0; // Unique ID counter for power-ups


let spawning = true; // Use a global flag to control spawning

function spawnPowerUps(backEndPowerUps, io, backEndPlayers) {
    const maxX = GAME_WIDTH - 100;
    const maxY = GAME_HEIGHT - 100;
    const min = 100;

    const interval = setInterval(() => {
    let someoneIsPlaying = false;
    for (const id in backEndPlayers){
      if (backEndPlayers[id].isPlaying) {
        someoneIsPlaying = true
        break
      }
    }

    if (!someoneIsPlaying) return

    // Stop spawning entirely if the limit is reached
    if (backEndPowerUps.length >= 20) {
        spawning = false;
        clearInterval(interval); // Stop setInterval
        return;
    }

    // Spawning logic when allowed
    let spawnX = Math.random() * (maxX - min) + min;
    let spawnY = Math.random() * (maxY - min) + min;

    const powerUpTypes = ["speed", "multiShot", "health", "damage", "shield","rapid","fire"];
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

    // Notify clients
    io.emit("spawnPowerUps", powerUpData);
  }, 15000); // Slowing down spawn interval (default: 15000)
}

// ------------------------------
// Power-up Collision Logic
// ------------------------------
function checkPowerUpCollision(backEndPowerUps, io, player, backEndPlayers) {
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
            rapid: Rapid,
            fire: Fire,
        };
        const PowerUpClass = powerUpClasses[powerUp.type];

        if (PowerUpClass) {
            // Apply powerup effects
            const powerUpInstance = new PowerUpClass(player, powerUp.id);

            // 👉 Check if the powerup can be applied before removing it
            if (powerUpInstance.canApplyPowerup()) {
                powerUpInstance.apply();

                // Emit to the player who collected it
                io.to(player.socketId).emit('powerupCollected', { 
                    type: powerUp.type, 
                    duration: powerUpInstance.duration
                });

                // NEW: Emit to all clients about which player collected what powerup
                io.emit('otherPlayerPowerup', {
                    playerId: player.socketId,
                    type: powerUp.type,
                    duration: powerUpInstance.duration
                });

                // Remove powerup from backend and notify frontend
                backEndPowerUps.splice(i, 1);
                io.emit("removePowerUp", (powerUp.id));

                // Restart spawning if needed
                if (backEndPowerUps.length < 13 && !spawning) {
                    spawning = true;
                    spawnPowerUps(backEndPowerUps, io);
                }
            } 
        }
    }
  }
}


// // Modify the projectile collision handler to account for shield and damage multipliers
// function handleProjectileCollision(projectile, targetPlayer, shooterId) {
//   // Find the shooter player
//   const shooter = backEndPlayers[shooterId];
  
//   if (!shooter) return 0; // Return if shooter doesn't exist
  
//   const equippedWeapon = shooter.equippedWeapon;
  
//   if (!equippedWeapon) return 0; // Return if no weapon equipped
  
//   const weaponMtps = {
//     light: shooter.lightWpnMtp,
//     heavy: shooter.heavyWpnMtp,
//     magic: shooter.magicWpnMtp
//   };
  
//   const weaponMtp = weaponMtps[equippedWeapon.type] || 1;
  
//   // Apply damage multiplier from powerup
//   const damageMultiplier = shooter.damageMultiplier || 1;
  
//   // Calculate total damage
//   let totalDamage = equippedWeapon.damage * weaponMtp * damageMultiplier;
  
//   // Apply damage considering shield
//   if (targetPlayer.shieldAmount > 0) {
//     if (totalDamage <= targetPlayer.shieldAmount) {
//       targetPlayer.shieldAmount -= totalDamage;
//       totalDamage = 0; // Shield absorbed all damage
//     } else {
//       totalDamage -= targetPlayer.shieldAmount; // Shield absorbed part of damage
//       targetPlayer.shieldAmount = 0;
//     }
//   }
  
//   // Only apply damage to health if there's any left after shield
//   if (totalDamage > 0) {
//     targetPlayer.health -= totalDamage;
//   }
  
//   return totalDamage;
// }

module.exports = { 
  spawnPowerUps, 
  checkPowerUpCollision,
};