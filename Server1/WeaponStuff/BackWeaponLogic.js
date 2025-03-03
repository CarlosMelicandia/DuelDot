const GAME_WIDTH = 1024 // Default width
const GAME_HEIGHT = 576 // Default height

let weaponsSpawned = []
function spawnWeapons(backEndWeapons) {
  const maxX = GAME_WIDTH - 50
  const maxY = GAME_HEIGHT - 50
  const min = 50
  
  setInterval(() => {
    let spawnX = Math.random() * (maxX - min) + min // generates a random number between 50 and width - 50
    let spawnY = Math.random() * (maxY - min) + min
    backEndWeapons.push({spawnX, spawnY})
  }, 5000) // Sets the time rate at which weapons spawn (Default = 5000)
}

function checkCollision(backEndWeapons, backEndPlayers) {
weaponsSpawned = weaponsSpawned.filter(weapon => {
    Weapons.update()
    const dist = Math.hypot(player.x - this.x, player.y - this.y)
    if (dist - backEndPlayers[playerId].radius - (backEndWeapons.width + backEndWeapons.height) < 1) {
      
    }
  })
}

module.exports = { 
  spawnWeapons, 
  checkCollision  
}