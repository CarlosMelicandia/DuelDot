// When a players joins it shows them the weapons that had spawned previously
socket.on("updateWeaponsOnJoin", (backEndWeapons) => {
    frontEndWeapons = {};

    backEndWeapons.forEach((weapon) => {
        frontEndWeapons[weapon.id] = new WeaponDrawing(weapon)
    })
})

// Waits for an updateWeapons from the back end to sync and spawn weapons
socket.on('updateWeapons', (weaponData) =>{
    if (weaponData.remove){ // if the weapon has been removed due to collision
      delete frontEndWeapons[weaponData.id] // deletes weapon
    }else{
      if (!frontEndWeapons[weaponData.id]){ // Creates the weapon in the frontEnd if it doesn't exist
        frontEndWeapons[weaponData.id] = new WeaponDrawing(weaponData) // Contains only x, y, type, radius, and color
      }
    }
})

socket.on('dropWeapon', (weaponData) => {
    frontEndWeapons[weaponData.id] = new WeaponDrawing(weaponData)
}) 

socket.on('removeWeapon', (player) => { 
    if (player.inventory[0] == null){ // if the first inventory is open 
        document.querySelector('#inventorySlot1Text').textContent = " " // Show weapon in inventory
    }
    if(player.inventory[1] == null){ // if the second inventory is open
    document.querySelector('#inventorySlot2Text').textContent = " " // Shows the weapon in the second slot
    }
    if (player.inventory[2] == null) {
        document.querySelector('#inventorySlot3Text').textContent = " ";
    }

})

// Waits for a weapon equip call from the server
socket.on('equipWeapon', (slotIndex, player) => {
    if (slotIndex === 0 && player.inventory[0] != null) {
        document.querySelector('#inventorySlot1Text').textContent = player.inventory[0].name;
    }
    if (slotIndex === 1 && player.inventory[1] != null) {
        document.querySelector('#inventorySlot2Text').textContent = player.inventory[1].name;
    }
    if (slotIndex === 2 && player.inventory[2] != null) {
        document.querySelector('#inventorySlot3Text').textContent = player.inventory[2].name;
    }

})

/**
 * ------------------------------
 * Handling Server Updates for Projectiles
 * ------------------------------
 */
/**
 * Keeps the front end (client-side) projectiles in sync with the back end (server).
 * When the server emits 'updateProjectiles', iterate over each projectile and
 * create or update them locally.
 */
socket.on("updateProjectiles", (backEndProjectiles) => {
  // Loop over each projectile from the server (each has a unique id)
  for (const id in backEndProjectiles) {
    const backEndProjectile = backEndProjectiles[id];

    /**
     * If a projectile with this id doesn't exist on the client,
     * create a new Projectile object using the server's data.
     */
    if (!frontEndProjectiles[id]) {
      frontEndProjectiles[id] = new Projectile({
        x: backEndProjectile.x,
        y: backEndProjectile.y,
        radius: 5,
        color: frontEndPlayers[backEndProjectile.playerId]?.color, // Checks if client Player with server projectiles id exists and assigns color if it does
        velocity: backEndProjectile.velocity,
      });
    } else {
      // Update the client projectile’s position based on the server’s velocity
      frontEndProjectiles[id].x += backEndProjectiles[id].velocity.x;
      frontEndProjectiles[id].y += backEndProjectiles[id].velocity.y;
    }
  }

  /**
   * Remove any client-side projectiles that are no longer present on the server.
   */
  for (const frontEndProjectileId in frontEndProjectiles) {
    if (!backEndProjectiles[frontEndProjectileId]) {
      delete frontEndProjectiles[frontEndProjectileId];
    }
  }
});