const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const scoreEl = document.querySelector('#scoreEl')
const healthEl = document.querySelector('#healthEl')

canvas.width = innerWidth
canvas.height = innerHeight

const x = canvas.width / 2
const y = canvas.height / 2


const player = new Rouge(x, y);
healthEl.innerHTML = player.health
const projectiles = []
const enemies = []
const particles = []

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

    //This makes the angle of enemies being spawned twords the player
    const angle = Math.atan2(player.y - y, player.x - x)
    //Under is the original code of the enemy trajectory
    //const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)

    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle)
    }

    enemies.push(new Enemy(x, y, radius, color, velocity, 100))
  }, 0) // was 1000
}

let animationId
let score = 0
let vx = 0
let vy = 0
function animate() {
  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.fillRect(0, 0, canvas.width, canvas.height)

  //calling the players body to be drawn (game functions without it)
  player.draw()

  // updates movement based on key press
  player.x += vx
  player.y += vy

  for (let index = particles.length - 1; index >= 0; index--) {
    const particle = particles[index]

    if (particle.alpha <= 0) {
      particles.splice(index, 1)
    } else {
      particle.update()
    }
  }

  for (let index = projectiles.length - 1; index >= 0; index--) {
    const projectile = projectiles[index]

    projectile.update()

    // remove from edges of screen
    if (
      projectile.x - projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      projectiles.splice(index, 1)
    }
  }

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
  
    if(player.health <= 0){
      cancelAnimationFrame(animationId)
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
        console.log(enemy.health)
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
        // this is where we shrink our enemy (to subtract health)

        if (enemy.health <=50) {

          score += 100
          scoreEl.innerHTML = score
          gsap.to(enemy, {
            radius: enemy.radius - (5)
            //((projectile.damage / 6)*.73)
          })
        //  projectiles.splice(projectilesIndex, 1)


        } if (enemy.health <=0) {
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
// Calling functions
animate()
spawnEnemies()

const myDivButton = document.createElement('div')
