// ------------------------------
// Power-up Spawner Logic
// ------------------------------

const GAME_WIDTH = 1024 // Default width
const GAME_HEIGHT = 576 // Default height
let powerUpId = 0; // Unique ID counter for power-ups


function spawnPowerUps(backEndPowerUps, io) {
  const maxX = GAME_WIDTH - 50;
  const maxY = GAME_HEIGHT - 50;
  const min = 50;

  setInterval(() => {
    if (backEndPowerUps.length > 10) return; // Limit number of power-ups

    let spawnX = Math.random() * (maxX - min) + min;
    let spawnY = Math.random() * (maxY - min) + min;

    const powerUpTypes = ["speed", "multiShot"];
    let powerUpType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];

    let powerUpColors = {
      "speed": "pink",
      "multiShot": "pink",
    };

    let newPowerUpId = powerUpId++; // Unique ID for power-ups

    let powerUpData = {
      id: newPowerUpId,
      x: spawnX,
      y: spawnY,
      radius: 10,
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
      switch (powerUp.type) {
        case 'speed':
          if (!player.originalSpeed) player.originalSpeed = player.speed;
          player.speed = player.originalSpeed * 1.8; // Increase speed
          setTimeout(() => {
            if (player) player.speed = player.originalSpeed || player.speed;
          }, 5000);
          break;

        case 'multiShot':
          player.hasMultiShot = true;
          setTimeout(() => {
            if (player) player.hasMultiShot = false;
          }, 5000);
          break;

      
      }

      // Remove power-up from the server and notify clients
      backEndPowerUps.splice(i, 1);
      io.emit("updatePowerUps", backEndPowerUps, { id: powerUp.id, remove: true });

      break;
    }
  }
}

module.exports = { 
  spawnPowerUps, 
  checkPowerUpCollision  
};