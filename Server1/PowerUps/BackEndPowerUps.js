// ------------------------------
// Power-up Spawner Logic
// ------------------------------
function spawnPowerUp() {
    const x = Math.random() * GAME_WIDTH;
    const y = Math.random() * GAME_HEIGHT;
    const types = ['speed', 'multiShot', 'health', 'shield', 'DMG']; 
    const type = types[Math.floor(Math.random() * types.length)]; // Randomly select a type
    const id = powerUpId++;
  
    const powerUpData = { x, y, type, id }; // Create the power-up object
  
    powerUps[id] = powerUpData; // Store it on the server
    io.emit('spawnPowerUp', powerUpData); // Send to all clients
  }
  
  setInterval(spawnPowerUp, 10000) // How often power ups spawn.

  /**
   * Listens for player collision with power ups-- need to implement collision detection for this to happen
   */
  socket.on('collectPowerUp', ({playerId, powerUpId}) => {
    if (powerUps[powerUpId] && backEndPlayers[playerId]) {
      const powerUp = powerUps[powerUpId];
      
      if (powerUp.type === 'speed') {
        // Store the player's original speed if not already stored
        if (!backEndPlayers[playerId].originalSpeed) {
          backEndPlayers[playerId].originalSpeed = SPEED;
        }
        
        // Apply speed boost
        backEndPlayers[playerId].speed = SPEED * 1.8; // 80% speed boost
        
        // When applying a power-up on the server
        backEndPlayers[playerId].hasPowerUp = true; // doesnt do anything yet

        // Set a timeout to reset the speed
        setTimeout(() => {
          if (backEndPlayers[playerId]) {  // Check if player still exists
            backEndPlayers[playerId].speed = backEndPlayers[playerId].originalSpeed || SPEED
          }
        }, 5000); // 5 seconds duration  
      } else if (powerUp.type === 'multiShot') {
        backEndPlayers[playerId].hasMultiShot = true; // Enable multi-shot for the player
        
        // Set a timeout to remove the power-up after 5 seconds
        setTimeout(() => {
          if (backEndPlayers[playerId]) {
            backEndPlayers[playerId].hasMultiShot = false;
          }
        }, 5000);
      }
      
      // Remove the power-up from the server
      delete powerUps[powerUpId];
      
      // Notify all clients to remove this power-up
      io.emit('removePowerUp', powerUpId);
    }
  })