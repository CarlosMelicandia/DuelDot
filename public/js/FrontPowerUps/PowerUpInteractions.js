socket.on('powerupCollected', (powerupData) => {
    const player = frontEndPlayers[socket.id];
    if (!player) return;
  
    // Apply powerup effect for visual feedback
    player.applyPowerup(powerupData.type, powerupData.duration);
});

socket.on('updatePowerUpsOnJoin', (backEndPowerUps) => {
    frontEndPowerUps = {};
    
    backEndPowerUps.forEach((powerUp) => {
      console.log(powerUp)
      frontEndPowerUps[powerUp.id] = new PowerUpDrawing(powerUp);
    });
});


socket.on('updatePowerUps', (backEndPowerUps, powerUpData) => {
    if (powerUpData.remove) { // If the power-up was collected, remove it
      delete frontEndPowerUps[powerUpData.id];
    } else {
      if (!frontEndPowerUps[powerUpData.id]) { // Create the power-up if it doesn't exist
        frontEndPowerUps[powerUpData.id] = new PowerUpDrawing(powerUpData); // Stores the power-up data
      }
    }
});

socket.on("removePowerUp", (powerUp) => {
  delete frontEndPowerUps[powerUp.id]; // Remove from frontend state
})