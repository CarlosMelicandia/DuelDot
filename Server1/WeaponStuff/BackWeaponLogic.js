const { Pistol, SubmachineGun, Sniper, Shuriken } = require("./Weapons")

const GAME_WIDTH = 1024 // Default width
const GAME_HEIGHT = 576 // Default height
let deletedWeaponIds = []

let weaponId = 0

function spawnWeapons(backEndWeapons, io) {
  const maxX = GAME_WIDTH - 50
  const maxY = GAME_HEIGHT - 50
  const min = 50

  setInterval(() => {
    if (backEndWeapons.length > 10 ) return
    let spawnX = Math.random() * (maxX - min) + min 
    let spawnY = Math.random() * (maxY - min) + min

    const weaponSpawn = ["pistol", "submachineGun", "sniper", "shuriken"]
    let weaponToSpawn = weaponSpawn[Math.floor(Math.random() * weaponSpawn.length)]
    let weaponColors = {
      "pistol": "red",
      "submachineGun": "blue",
      "sniper": "yellow",
      "shuriken": "orange"
    }

    let newWeaponId = deletedWeaponIds.length > 0 ? deletedWeaponIds.shift() : weaponId++

    let weaponData = ({
      id: newWeaponId,
      x: spawnX, 
      y: spawnY,
      radius: 10,
      color: weaponColors[weaponToSpawn],
      type: weaponToSpawn
    })

    // Add new weapon and then sort by ID
    backEndWeapons.push(weaponData)

    io.emit("updateWeapons", weaponData)
  }, 5000) // Sets the time rate at which weapons spawn (Default = 7500)
}

function weaponDrop(weapon, x, y, io, backEndWeapons){
  console.log("Cooking")

  let newWeaponId = deletedWeaponIds.length > 0 ? deletedWeaponIds.shift() : weaponId++

  weaponData = ({
    id: newWeaponId,
    x: x, 
    y: y,
    radius: 10,
    color: weapon.color,
    type: weapon.type
  })

  console.log(`Dropped ${weapon.name} at ${x} and ${y}, ${weaponData}`, weaponData)
  
  backEndWeapons.push(weaponData)

  io.emit("dropWeapon", weaponData)
}

function checkCollision(backEndWeapons, io, player) {
  for (let i = backEndWeapons.length - 1; i >= 0; i--) {

    if (backEndWeapons[i].isDropped == true) return // Currently I am stuck in trying to figure out how to not pick up weapon when player drops it 

    let weapon = backEndWeapons[i]
    let dist = Math.hypot(player.x - weapon.x, player.y - weapon.y)

    if (dist < player.radius + weapon.radius) {
      if (player.inventory.length >= 2) return

      console.log(`Player picked up ${weapon.name}`)
      
      const weapons = {
        pistol: Pistol,
        submachineGun: SubmachineGun,
        sniper: Sniper,
        shuriken: Shuriken
      }
      
      const weaponEquipped = new weapons[weapon.type]() // Creates a weapon object when a player picks it up
      
      player.inventory.push(weaponEquipped)
      
      io.to(player.socketId).emit('equipWeapon', weaponEquipped, player)

      backEndWeapons.splice(i, 1) // Remove weapon from array
      deletedWeaponIds.push(weapon.id)

      // Send updated weapons + the removed weapon
      io.emit("updateWeapons", { id: weapon.id, remove: true })

      break;
    }
  }
}




module.exports = { 
  spawnWeapons, 
  checkCollision,
  weaponDrop  
}