// ------------------------------
// Power-up Spawner Logic
// ------------------------------

const GAME_WIDTH = 1024 // Default width
const GAME_HEIGHT = 576 // Default height
let powerUpId = 0; // Unique ID counter for power-ups

const POWERUP_DURATION = 5000;


function spawnPowerUps(backEndPowerUps, io) {
  const maxX = GAME_WIDTH - 50;
  const maxY = GAME_HEIGHT - 50;
  const min = 50;

  setInterval(() => {
    if (backEndPowerUps.length > 15) return; // Limit number of power-ups

    let spawnX = Math.random() * (maxX - min) + min;
    let spawnY = Math.random() * (maxY - min) + min;

    const powerUpTypes = ["speed", "multiShot", "health", "damage", "shield"];
    let powerUpType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];

    let powerUpColors = {
      "speed": "yellow",
      "multiShot": "red",
      "health": "green",
      "damage": "orange",
      "shield": "blue"
    };

    let newPowerUpId = powerUpId++; // Unique ID for power-ups

    let powerUpData = {
      id: newPowerUpId,
      x: spawnX,
      y: spawnY,
      radius: 22,
      color: powerUpColors[powerUpType],
      type: powerUpType
    };

    // Add new power-up
    backEndPowerUps.push(powerUpData);

    // Notify all clients about the new power-up
    io.emit("updatePowerUps", backEndPowerUps, powerUpData);
  }, 5000); // Power-ups spawn every 5 seconds (same as weapons)
}

// ------------------------------
// Power-up Collision Logic
// ------------------------------
function checkPowerUpCollision(backEndPowerUps, io, player) {
  for (let i = backEndPowerUps.length - 1; i >= 0; i--) {
    let powerUp = backEndPowerUps[i];
    let dist = Math.hypot(player.x - powerUp.x, player.y - powerUp.y);

    if (dist < player.radius + powerUp.radius) { // Collision detected
      console.log(`Player picked up ${powerUp.type}`)
      switch (powerUp.type) {
        case 'speed':
          if (!player.originalSpeed) player.originalSpeed = player.speed;
          player.speed = player.originalSpeed * 1.8; // Increase speed
          
          // Store powerup info to display the aura
          player.activePowerups = player.activePowerups || {};
          player.activePowerups.speed = {
            active: true,
            endTime: Date.now() + POWERUP_DURATION
          };
          
          // Reset speed after duration
          setTimeout(() => {
            if (player) {
              player.speed = player.originalSpeed;
              
              if (player.activePowerups && player.activePowerups.speed) {
                player.activePowerups.speed.active = false;
              }
            }
          }, POWERUP_DURATION);
          break;

        case 'multiShot':
          player.hasMultiShot = true;
          
          // Store powerup info to display the aura
          player.activePowerups = player.activePowerups || {};
          player.activePowerups.multiShot = {
            active: true,
            endTime: Date.now() + POWERUP_DURATION
          };
          
          // Reset multishot after duration
          setTimeout(() => {
            if (player) {
              player.hasMultiShot = false;
              
              if (player.activePowerups && player.activePowerups.multiShot) {
                player.activePowerups.multiShot.active = false;
              }
            }
          }, POWERUP_DURATION);
          break;
          
        case 'health':
          // Restore 5% of max health, but don't exceed max
          player.health = Math.min(player.maxHealth, player.health + (player.maxHealth * 0.35));
          
          // Store powerup info to display the aura briefly
          player.activePowerups = player.activePowerups || {};
          player.activePowerups.health = {
            active: true,
            endTime: Date.now() + 1000 // Show effect briefly
          };
          
          // Remove health aura after a brief moment
          setTimeout(() => {
            if (player && player.activePowerups && player.activePowerups.health) {
              player.activePowerups.health.active = false;
            }
          }, 1000);
          break;
          
        case 'damage':
          player.damageMultiplier = player.damageMultiplier || 1;
          player.damageMultiplier += 2; // Double damage
          
          // Store powerup info to display the aura
          player.activePowerups = player.activePowerups || {};
          player.activePowerups.damage = {
            active: true,
            endTime: Date.now() + POWERUP_DURATION
          };
          
          // Reset damage multiplier after duration
          setTimeout(() => {
            if (player) {
              player.damageMultiplier = 1;
              
              if (player.activePowerups && player.activePowerups.damage) {
                player.activePowerups.damage.active = false;
              }
            }
          }, POWERUP_DURATION);
          
          
          // Only remove the shield effect aura after duration
          // (The shield points will remain until depleted)
          setTimeout(() => {
            if (player && player.activePowerups && player.activePowerups.shield) {
              player.activePowerups.shield.active = false;
            }
          }, POWERUP_DURATION * 2);
          break;
      }

      // Notify client about powerup pickup
      io.to(player.socketId).emit('powerupCollected', {
        type: powerUp.type,
        duration: POWERUP_DURATION,
        color: powerUp.color
      });

      // Remove power-up from the server and notify clients
      backEndPowerUps.splice(i, 1);
      io.emit("updatePowerUps", backEndPowerUps, { id: powerUp.id, remove: true });
      break;
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