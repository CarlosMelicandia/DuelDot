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
})

// Waits for a weapon equip call from the server
socket.on('equipWeapon', (slotIndex, player) => {
    if (player.inventory[0] != null  && player.inventory[1] == null){ // if the first inventory is open 
      document.querySelector('#inventorySlot1Text').textContent = player.inventory[slotIndex].name // Show weapon in inventory
    }
    if(player.inventory[0] != null && player.inventory[1] != null){ // if the second inventory is open
        document.querySelector('#inventorySlot2Text').textContent = player.inventory[slotIndex].name // Shows the weapon in the second slot
    }   
})