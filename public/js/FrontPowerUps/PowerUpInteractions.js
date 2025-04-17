socket.on('powerupCollected', (powerupData) => {
    const player = frontEndPlayers[socket.id];
    if (!player) return;
  
    // Apply powerup effect for visual feedback
    player.applyPowerup(powerupData.type, powerupData.duration);
});

socket.on('updatePowerUpsOnJoin', (backEndPowerUps) => {
    frontEndPowerUps = {};
    
    backEndPowerUps.forEach((powerUp) => {
      frontEndPowerUps[powerUp.id] = new PowerUpDrawing(powerUp);
    });
});

socket.on("spawnPowerUps", (powerUpData) => {
  if (!frontEndPowerUps[powerUpData.id]) { // Create the power-up if it doesn't exist
    frontEndPowerUps[powerUpData.id] = new PowerUpDrawing(powerUpData); // Stores the power-up data
  }
})

socket.on("removePowerUp", (id) => {
  delete frontEndPowerUps[id]
})

socket.on('updatePowerUps', (backEndPowerUps) => {
  backEndPowerUps.forEach((powerUp) => {
    frontEndPowerUps[powerUp.id] = new PowerUpDrawing(powerUp);
  })
});
