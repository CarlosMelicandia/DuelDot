const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const scoreEl = document.querySelector('#scoreEl')
const healthEl = document.querySelector('#healthEl')

canvas.width = innerWidth
canvas.height = innerHeight

const x = canvas.width / 2
const y = canvas.height / 2

let player
let projectiles = []
let particles = []

const enemies = []
function spawnEnemies() {
  setInterval(() => {
    const radius = 25
    // const radius = Math.random() * (30 - 4) + 4
    let x
    let y

    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
      y = Math.random() * canvas.height
    } else {
      x = Math.random() * canvas.width
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
    }

    const color = `hsl(${Math.random() * 360}, 50%, 50%)`

    enemies.push(new Enemy(x, y, radius, color, 100)) // Creates an enemy and adds it to the enemies array
  }, 1000) // Sets the time rate at which enemies spawn (Default = 1000)
}

let upgrades = []
function spawnUpgradeOrbs() {
  const max = canvas.width - 50
  const min = 50
  setInterval(() => {
    let spawnX = Math.random() * (max - min) + min // generates a random number between 50 and width - 50
    let spawnY = Math.random() * (max - min) + min
    upgrades.push(new SpeedUpgrade(spawnX, spawnY))
  }, 5000) // Sets the time rate at which orbs spawn (Default = 5000)
}

function checkPlayer(){
  if (!player){
    return 
  }
}

let animationId
let score = 0
let vx = 0
let vy = 0
function animate() {
  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.fillRect(0, 0, canvas.width, canvas.height)

  if (!player){
    return 
  }

  //calling the players body to be drawn (game functions without it)
    player.draw()
  // updates movement based on key press
    player.x += vx
    player.y += vy
  

  upgrades = upgrades.filter(upgrade => {
    upgrade.update()

    if (upgrade.isCollided()) {
      return false
    }
    return true
  })

  for (let index = particles.length - 1; index >= 0; index--) {
    const particle = particles[index]

    if (particle.alpha <= 0) {
      particles.splice(index, 1)
    } else {
      particle.update()
    }
  }

  /**
   * .filter return a shallow copy of projectiles
   * For element (projectile) in projectiles it first updates the projectile and checks if its within bounds
   * return false (meaning filtered out of projectiles array) if its out of bounds
   */
  projectiles = projectiles.filter(projectile => {
    projectile.update()
    return !(
      // Checks to see whether they are on screen, if they are returns false meaning they are removed
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    )
  })

  for (let index = enemies.length - 1; index >= 0; index--) {
    const enemy = enemies[index]

    enemy.update()

    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

    //end game ( we have to modify this to subtract health )
    if (dist - enemy.radius - player.radius < 1) {
      player.health -= 50
      healthEl.innerHTML = player.health
      enemies.splice(index, 1)
      // cancelAnimationFrame(animationId)

      if (player.health <= 0) {
        cancelAnimationFrame(animationId)
        return
      }
    }

    for (
      let projectilesIndex = projectiles.length - 1;
      projectilesIndex >= 0;
      projectilesIndex--
    ) {
      const projectile = projectiles[projectilesIndex]

      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

      // when projectiles touch enemy
      if (dist - enemy.radius - projectile.radius < 1) {
        projectiles.splice(projectilesIndex, 1)

        enemy.health -= projectile.damage
        // create explosions
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 6),
                y: (Math.random() - 0.5) * (Math.random() * 6)
              }
            )
          )
        }

        if (enemy.health <= 50) {

          score += 100
          scoreEl.innerHTML = score
          gsap.to(enemy, {
            radius: enemy.radius - (5)
            //((projectile.damage / 6)*.73)
          })
          //  projectiles.splice(projectilesIndex, 1)


        } if (enemy.health <= 0) {
          // remove enemy if they are too small (kill if health gets to low)
          score += 150
          scoreEl.innerHTML = score

          enemies.splice(index, 1)
          projectiles.splice(projectilesIndex, 1)
        }
      }
    }
  }
}

const myDivButton = document.createElement('div')
