/**
   * When the client emits a 'shoot' event, a new projectile is created.
   */

let projectileId = 0 // Unique ID counter for each projectile create

const { updateLeaderBoard, updateKillFeed } = require("../backendLeaderBoard.js");

function playerShoot(socket, backEndPlayers, backEndProjectiles){
    socket.on('shoot', ({ x, y, angle }) => { 
        const player = backEndPlayers[socket.id]
        const weapon = player.equippedWeapon;

        if (!player || player.equippedWeapon.type == "melee") return // checks that the player is alive and doesn't have a melee
        
        if (player.equippedWeapon.isReloaded) { 
        let fireRate = 0;
        if (!player.hasRapidFire) {
          fireRate = backEndPlayers[socket.id].equippedWeapon.fireRate * 1000
        } else {
          fireRate = backEndPlayers[socket.id].equippedWeapon.fireRate * 1000 / 10
        }

        const createProjectile = (angle) => {
        projectileId++ // Increment the projectile ID

        // Calculate the velocity of the projectile based on the angle provided by the client
        const velocity = {
            x: Math.cos(angle) * weapon.velocity,  //Weapon Velocity 
            y: Math.sin(angle) * weapon.velocity   // Weapon Velocity
        }

        // Create a new server-side projectile
        backEndProjectiles[projectileId] = {
            x,
            y,
            velocity,
            playerId: socket.id
        }
        }

        createProjectile(angle)

        // If multi-shot is active, create additional projectiles
        if (player.hasMultiShot) {
        const spreadAngle = 15 * (Math.PI / 180) // 15 degrees in radians
        createProjectile(angle - spreadAngle) // Left shot
        createProjectile(angle + spreadAngle) // Right shot
        }

        // Delay Calculation 
        weapon.isReloaded = false
        
          setTimeout(() => {
            weapon.isReloaded = true
          }, fireRate)
        }
    })
}

/**
   * When client emits a punch event, a punch is made
   */
function playerPunch(socket, backEndPlayers){
    socket.on('punch', () => {
        // This may require a separate io.emit that just focuses on this punch and remove  -----------------
        // This is due to some delay may happen since its every 15ms update, would not need to change .handX 
        // or anything and this would be done in the frontEnd with a socket.on "punch" or something
        const backEndPlayer = backEndPlayers[socket.id]

        if (!backEndPlayer || !backEndPlayer.canPunch) return

        backEndPlayer.canPunch = false

        backEndPlayer.handX += .2
        setTimeout (() => {
        backEndPlayer.handX = 1.5
        backEndPlayer.canPunch = true
        }, 1000)
    })
}

function playerProjectile(backEndProjectiles, backEndPlayers, io, gameWidth, gameHeight, projectileRadius){
      // Update projectile positions
  for (const id in backEndProjectiles) {
    const projectile = backEndProjectiles[id]
    projectile.x += projectile.velocity.x;
    projectile.y += projectile.velocity.y;

    // Remove projectiles that go out of bounds
    if (
      projectile.x - projectileRadius >= gameWidth ||
      projectile.x + projectileRadius <= 0 ||
      projectile.y - projectileRadius >= gameHeight ||
      projectile.y + projectileRadius <= 0
    ) {
      delete backEndProjectiles[id];
      continue;
    }

    // Detect projectile collisions with players
    for (const playerId in backEndPlayers) {
      const backEndPlayer = backEndPlayers[playerId];
      // Calculate the distance between the player and the projectile
      const DISTANCE = Math.hypot(
        projectile.x - backEndPlayer.x,
        projectile.y - backEndPlayer.y
      );

      // Check if a collision occurred
      if (
        DISTANCE < projectileRadius + backEndPlayer.radius &&
        projectile.playerId !== playerId
      ) {
          // Find the shooter (who fired the projectile)
        const shooter = backEndPlayers[projectile.playerId];
          //If the target is invincible (Tank shield), skip damage
          if (backEndPlayer.invincible) {
              delete backEndProjectiles[id]
              break // ← exit player loop early
          }
        if(shooter){
        const equippedWeapon = shooter.equippedWeapon

        const weaponMtps = { // List of all possible weapon multipliers
          light: shooter.lightWpnMtp,
          heavy: shooter.heavyWpnMtp,
          magic: shooter.MagicWpnMtp
        }
        const weaponMtp = weaponMtps[equippedWeapon.type] // Obtains the specific weapon multiplier based on th weapons type
        const damageMultiplier = shooter.damageMultiplier 
          
        const totalDamage = equippedWeapon.damage * weaponMtp * damageMultiplier

        console.log(totalDamage)
        // Check if the target has a shield
        if (backEndPlayer.shieldAmount > 0) {
          if (totalDamage <= backEndPlayer.shieldAmount) {
            // Shield absorbs all damage
            backEndPlayer.shieldAmount -= totalDamage
            totalDamage = 0
          } else {
            // Shield absorbs part of the damage
            totalDamage -= backEndPlayer.shieldAmount
            backEndPlayer.shieldAmount = 0
          }
        }

        // Apply remaining damage to health
        if (totalDamage > 0) { // Checks if this line is needed
          backEndPlayer.health -= totalDamage
        }
        if (shooter.hasFire) { 
          // Fire effect is active, so we start applying periodic damage
      
          const fireInterval = setInterval(() => {
              
              backEndPlayer.health -= 35;
          }, 3000); // Damage occurs in 3-second intervals
      
          // Stop the fire effect after 5 seconds
          setTimeout(() => {
              clearInterval(fireInterval); // Clears the interval so damage stops
          }, 5000);
      }
      }

        // If health reaches 0, remove the player and reward the shooter
        if(backEndPlayer.health <= 0){ 
        
          if (backEndPlayers[projectile.playerId]) {
            backEndPlayers[projectile.playerId].score++;
          }
          updateKillFeed(backEndPlayers, backEndProjectiles, playerId, id, io);// Update the Kill Feed when a player is eliminated
          io.to(playerId).emit("playerRespawn")

          delete backEndPlayers[playerId];
          updateLeaderBoard(backEndPlayers, io, playerId); // Update the leaderboard when a player is eliminated
      }

        // Remove the projectile
        delete backEndProjectiles[id];
        break;
      }
    }
  }
  io.emit("updateProjectiles", backEndProjectiles) // Send an updated list of projectiles to all clients
}

module.exports = { playerPunch, playerShoot, playerProjectile }