/** Represents a player in the game. Each player has:
 * - A position (`x`, `y`)
 * - A visual representation (a colored circle)
 * - A username displayed above them
 * - Health and a health bar 
 * - Speed 
 */
class Player {
  /**
   * Constructor for the Player.
   * @param {number} x - The initial x-coordinate of the player.
   * @param {number} y - The initial y-coordinate of the player.
   * @param {number} radius - The radius of the player (size).
   * @param {string} color - The color of the player.
   * @param {string} username - The player's displayed username.
   * @param {number} health - The player's initial health.
   * @param {number} speed - The player's movement speed.
   * @param {int} score - The player's score.
   */
  constructor({ x, y, radius, color, username, health, speed, score, canShoot, equippedWeapon }) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.username = username
    this.health = health // Initialize health 
    this.maxHealth = health // Store max health for calculations 
    this.speed = speed // Movement speed
    this.score = score
    this.canShoot = canShoot
    this.equippedWeapon = equippedWeapon

    this.aimAngle = 0
    this.handXMove = 0

    this.activeEffects = {}; // Object to track active power-up effects
    this.lightningPoints = []; // For speed effect
    this.shieldPulse = 0; // For shield effect
    this.shieldPulseDir = 1;
    this.rotation = 0; // For rotating effects
    this.flameHeight = 0; // For fire effect
    this.effectParticles = []; // For all effect particles
}

// Add this method to your Player class:
applyPowerup(type, duration) {
  // Store the powerup info
  this.activeEffects[type] = {
    startTime: Date.now(),
    duration: duration,
    particles: []
  };
  
  // Generate initial effect elements
  if (type === "speed") {
    this.lightningPoints = this.generateLightningPoints();
  }
}

// Add these helper methods to your Player class:
generateLightningPoints() {
  const points = [];
  const count = Math.floor(Math.random() * 3) + 3; // 3-5 lightning bolts
  
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const segments = Math.floor(Math.random() * 3) + 3; // 3-5 segments per bolt
    const bolt = {
      angle: angle,
      segments: []
    };
    
    // Generate bolt segments
    for (let j = 0; j <= segments; j++) {
      const progress = j / segments;
      const jitter = (j === 0 || j === segments) ? 0 : (Math.random() - 0.5) * 0.2;
      bolt.segments.push({
        distance: progress,
        jitter: jitter
      });
    }
    
    points.push(bolt);
  }
  
  return points;
}

createEffectParticle(type) {
  // Colors for different powerup effects
  const effectColors = {
    "speed": "#FFFF00", // Yellow
    "multiShot": "#FF0000", // Red
    "health": "#00FF00", // Green
    "damage": "#FFA500", // Orange
    "shield": "#4bb3e1", // Blue
    "rapid": "#ff8600", // Orange-ish
    "fire": "#FF4500",  // Orange-Red
  };
  
  let angle, distance, vx, vy;
  
  switch (type) {
    case "speed":
      angle = Math.random() * Math.PI * 2;
      distance = Math.random() * this.radius * 0.8;
      vx = Math.cos(angle) * (Math.random() * 2 + 1);
      vy = Math.sin(angle) * (Math.random() * 2 + 1);
      break;
      
    case "multiShot":
      angle = Math.random() * Math.PI * 2;
      distance = this.radius * (0.9 + Math.random() * 0.3);
      vx = Math.cos(angle + Math.PI/2) * 1.5; // Tangential velocity
      vy = Math.sin(angle + Math.PI/2) * 1.5;
      break;
      
    case "health":
      angle = Math.random() * Math.PI * 2;
      distance = this.radius * (0.5 + Math.random() * 0.5);
      vx = Math.cos(angle) * (Math.random() + 0.5);
      vy = Math.sin(angle) * (Math.random() + 0.5);
      break;
      
    case "damage":
      angle = Math.random() * Math.PI * 2;
      distance = this.radius * 0.5;
      vx = Math.cos(angle) * (Math.random() * 3 + 2);
      vy = Math.sin(angle) * (Math.random() * 3 + 2);
      break;
      
    case "shield":
      angle = Math.random() * Math.PI * 2;
      distance = this.radius * 1.2;
      vx = Math.cos(angle) * 0.5;
      vy = Math.sin(angle) * 0.5;
      break;
      
    case "rapid":
      angle = Math.random() * Math.PI * 2;
      distance = this.radius * (0.9 + Math.random() * 0.3);
      vx = Math.cos(angle + Math.PI/2) * 2;
      vy = Math.sin(angle + Math.PI/2) * 2;
      break;
      
    case "fire":
      angle = Math.PI * (0.5 + (Math.random() * 2 - 1) * 0.3); // Upward with variation
      distance = this.radius * (0.8 + Math.random() * 0.4);
      vx = Math.cos(angle) * (Math.random() * 1 + 1);
      vy = Math.sin(angle) * (Math.random() * 2 + 3) * -1; // Upward movement
      break;
      
    default:
      angle = Math.random() * Math.PI * 2;
      distance = Math.random() * this.radius;
      vx = Math.cos(angle) * 1;
      vy = Math.sin(angle) * 1;
  }
  
  return {
    x: this.x + Math.cos(angle) * distance,
    y: this.y + Math.sin(angle) * distance,
    vx: vx,
    vy: vy,
    radius: Math.random() * 3 + 2,
    alpha: 1,
    life: 40, // Adjust based on type if needed
    color: effectColors[type],
    type: type,
    scaleY: type === "fire" ? 1.5 + Math.random() : 1
  };
}

// To handle effect drawing:
drawPowerupEffects() {
  this.rotation += 0.03;
  if (this.rotation >= Math.PI * 2) this.rotation = 0;
  
  // Update shield pulse
  this.shieldPulse += 0.03 * this.shieldPulseDir;
  if (this.shieldPulse >= 1) this.shieldPulseDir = -1;
  else if (this.shieldPulse <= 0) this.shieldPulseDir = 1;
  
  // Update flame height
  this.flameHeight = Math.sin(Date.now() / 100) * 0.3 + 1.0;
  
  // Generate and update particles
  for (const type in this.activeEffects) {
    const effect = this.activeEffects[type];
    const elapsed = Date.now() - effect.startTime;
    
    // Remove expired effects
    if (elapsed >= effect.duration) {
      delete this.activeEffects[type];
      continue;
    }
    
    // Calculate remaining time ratio (for fading out effects)
    const remainingRatio = Math.max(0, 1 - (elapsed / effect.duration));
    
    // Generate new particles based on effect type
    if (Math.random() < 0.2 * remainingRatio) {
      this.effectParticles.push(this.createEffectParticle(type));
    }
    
    // Draw specific effect
    switch (type) {
      case "shield":
        this.drawShieldEffect(remainingRatio);
        break;
        
      case "speed":
        this.drawSpeedEffect(remainingRatio);
        break;
        
      case "fire":
        this.drawFireEffect(remainingRatio);
        break;
        
      case "multiShot":
      case "rapid":
        this.drawOrbitEffect(type, remainingRatio);
        break;
        
      case "health":
        this.drawHealthEffect(remainingRatio);
        break;
    }
  }
  
  // Update and draw particles
  for (let i = this.effectParticles.length - 1; i >= 0; i--) {
    const p = this.effectParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.02;
    p.life--;
    
    // Special updates for certain particle types
    if (p.type === "fire") {
      p.radius *= 0.98; // Shrink fire particles
      p.vx *= 0.95; // Slow down horizontal movement
    }
    
    // Remove dead particles
    if (p.life <= 0 || p.alpha <= 0) {
      this.effectParticles.splice(i, 1);
      continue;
    }
    
    // Draw the particle
    c.beginPath();
    if (p.type === "fire") {
      c.ellipse(p.x, p.y, p.radius, p.radius * p.scaleY, 0, 0, Math.PI * 2);
    } else {
      c.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    }
    c.fillStyle = p.color;
    c.globalAlpha = p.alpha;
    c.fill();
    c.globalAlpha = 1;
    c.closePath();
  }
}

// Methods for specific effect types:
drawShieldEffect(remainingRatio) {
  const radius = this.radius * 1.2;
  
  // Draw shield bubble
  c.beginPath();
  c.arc(this.x, this.y, radius, 0, Math.PI * 2);
  c.lineWidth = 3;
  c.strokeStyle = "#4bb3e1";
  c.globalAlpha = (0.7 + this.shieldPulse * 0.3) * remainingRatio;
  c.stroke();
  
  // Shield glow
  c.beginPath();
  c.arc(this.x, this.y, radius, 0, Math.PI * 2);
  const gradient = c.createRadialGradient(
    this.x, this.y, this.radius,
    this.x, this.y, radius
  );
  gradient.addColorStop(0, "rgba(75, 179, 225, 0)");
  gradient.addColorStop(1, "rgba(75, 179, 225, 0.3)");
  c.fillStyle = gradient;
  c.globalAlpha = 0.4 * remainingRatio;
  c.fill();
  
  // Shield points
  c.globalAlpha = 0.8 * remainingRatio;
  for (let i = 0; i < 8; i++) {
    const angle = i * Math.PI / 4 + this.rotation;
    const x = this.x + Math.cos(angle) * radius;
    const y = this.y + Math.sin(angle) * radius;
    
    c.beginPath();
    c.arc(x, y, 3, 0, Math.PI * 2);
    c.fillStyle = "#4bb3e1";
    c.fill();
  }
  
  c.globalAlpha = 1;
}

drawSpeedEffect(remainingRatio) {
  // Update lightning every few frames
  if (Math.random() < 0.1) {
    this.lightningPoints = this.generateLightningPoints();
  }
  
  // Draw lightning
  const radius = this.radius * 1.5;
  c.lineWidth = 2;
  c.strokeStyle = "#FFFF00";
  c.globalAlpha = 0.7 * remainingRatio;
  
  for (const bolt of this.lightningPoints) {
    c.beginPath();
    c.moveTo(this.x, this.y);
    
    for (let i = 1; i < bolt.segments.length; i++) {
      const segment = bolt.segments[i];
      const jitterAngle = bolt.angle + segment.jitter;
      
      const x = this.x + Math.cos(jitterAngle) * (radius * segment.distance);
      const y = this.y + Math.sin(jitterAngle) * (radius * segment.distance);
      
      c.lineTo(x, y);
    }
    
    c.stroke();
  }
  
  // Speed aura
  c.beginPath();
  const gradient = c.createRadialGradient(
    this.x, this.y, this.radius * 0.8,
    this.x, this.y, this.radius * 1.3
  );
  gradient.addColorStop(0, "rgba(255, 255, 0, 0.4)");
  gradient.addColorStop(1, "rgba(255, 255, 0, 0)");
  c.fillStyle = gradient;
  c.globalAlpha = 0.3 * remainingRatio;
  c.arc(this.x, this.y, this.radius * 1.3, 0, Math.PI * 2);
  c.fill();
  
  c.globalAlpha = 1;
}

drawFireEffect(remainingRatio) {
  const baseRadius = this.radius;
  const flameCount = 8;
  
  // Fire base glow
  c.beginPath();
  const gradient = c.createRadialGradient(
    this.x, this.y, baseRadius * 0.8,
    this.x, this.y, baseRadius * 1.5
  );
  gradient.addColorStop(0, "rgba(255, 100, 0, 0.3)");
  gradient.addColorStop(1, "rgba(255, 100, 0, 0)");
  c.fillStyle = gradient;
  c.globalAlpha = 0.4 * remainingRatio;
  c.arc(this.x, this.y, baseRadius * 1.5, 0, Math.PI * 2);
  c.fill();
  
  // Flames
  c.globalAlpha = 0.6 * remainingRatio;
  
  for (let i = 0; i < flameCount; i++) {
    const angle = (i / flameCount) * Math.PI * 2 + this.rotation;
    const flameHeight = baseRadius * this.flameHeight;
    
    c.beginPath();
    c.moveTo(
      this.x + Math.cos(angle) * baseRadius * 0.9,
      this.y + Math.sin(angle) * baseRadius * 0.9
    );
    
    const cp1x = this.x + Math.cos(angle - 0.2) * baseRadius * 1.3;
    const cp1y = this.y + Math.sin(angle - 0.2) * baseRadius * 1.3;
    const cp2x = this.x + Math.cos(angle + 0.2) * baseRadius * 1.3;
    const cp2y = this.y + Math.sin(angle + 0.2) * baseRadius * 1.3;
    const endX = this.x + Math.cos(angle) * (baseRadius + flameHeight);
    const endY = this.y + Math.sin(angle) * (baseRadius + flameHeight);
    
    c.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    
    const flameGradient = c.createLinearGradient(
      this.x, this.y,
      endX, endY
    );
    flameGradient.addColorStop(0, "rgba(255, 69, 0, 0)");
    flameGradient.addColorStop(0.5, "rgba(255, 69, 0, 0.8)");
    flameGradient.addColorStop(1, "rgba(255, 255, 0, 0.4)");
    
    c.fillStyle = flameGradient;
    c.fill();
  }
  
  c.globalAlpha = 1;
}

drawOrbitEffect(type, remainingRatio) {
  const radius = this.radius * 1.3;
  const orbitCount = type === "multiShot" ? 3 : 5;
  const color = type === "multiShot" ? "#FF0000" : "#ff8600";
  
  // Draw orbit objects
  c.globalAlpha = 0.8 * remainingRatio;
  
  for (let i = 0; i < orbitCount; i++) {
    const angle = this.rotation + (i * (Math.PI * 2) / orbitCount);
    const x = this.x + Math.cos(angle) * radius;
    const y = this.y + Math.sin(angle) * radius;
    
    c.beginPath();
    
    if (type === "multiShot") {
      // Draw projectile shapes
      const size = 5;
      const pointAngle = angle + Math.PI / 2;
      
      c.moveTo(
        x + Math.cos(pointAngle) * size,
        y + Math.sin(pointAngle) * size
      );
      c.lineTo(
        x + Math.cos(pointAngle + (2.3 * Math.PI / 3)) * size,
        y + Math.sin(pointAngle + (2.3 * Math.PI / 3)) * size
      );
      c.lineTo(
        x + Math.cos(pointAngle + (3.7 * Math.PI / 3)) * size,
        y + Math.sin(pointAngle + (3.7 * Math.PI / 3)) * size
      );
    } else {
      // Draw bullets for rapid fire
      c.arc(x, y, 3, 0, Math.PI * 2);
      
      // Bullet trail
      const trailLength = 10;
      const trailAngle = angle - Math.PI / 2;
      
      c.moveTo(x, y);
      c.lineTo(
        x + Math.cos(trailAngle) * trailLength,
        y + Math.sin(trailAngle) * trailLength
      );
    }
    
    c.fillStyle = color;
    c.fill();
    
    // Add white outline to rapid bullets
    if (type === "rapid") {
      c.strokeStyle = "#ffffff";
      c.lineWidth = 1;
      c.stroke();
    }
  }
  
  // Draw orbit path
  c.beginPath();
  c.arc(this.x, this.y, radius, 0, Math.PI * 2);
  c.strokeStyle = color;
  c.globalAlpha = 0.2 * remainingRatio;
  c.lineWidth = 1;
  c.stroke();
  
  c.globalAlpha = 1;
}

drawHealthEffect(remainingRatio) {
  // Healing rings
  const pulseCount = 3;
  
  for (let i = 0; i < pulseCount; i++) {
    const pulseOffset = (i / pulseCount) * Math.PI * 2;
    const pulseSize = (Math.sin(this.rotation * 2 + pulseOffset) + 1) * 0.5;
    const pulseRadius = this.radius * (1 + pulseSize * 0.5);
    
    c.beginPath();
    c.arc(this.x, this.y, pulseRadius, 0, Math.PI * 2);
    c.strokeStyle = "#00FF00";
    c.lineWidth = 2;
    c.globalAlpha = (0.8 - pulseSize * 0.6) * remainingRatio;
    c.stroke();
  }
  
  // Healing cross
  const crossSize = this.radius * 0.5;
  c.beginPath();
  c.moveTo(this.x - crossSize, this.y);
  c.lineTo(this.x + crossSize, this.y);
  c.moveTo(this.x, this.y - crossSize);
  c.lineTo(this.x, this.y + crossSize);
  c.strokeStyle = "#00FF00";
  c.lineWidth = 3;
  c.globalAlpha = 0.7 * remainingRatio;
  c.stroke();
  
  // Healing aura
  c.beginPath();
  const gradient = c.createRadialGradient(
    this.x, this.y, this.radius * 0.5,
    this.x, this.y, this.radius * 1.5
  );
  gradient.addColorStop(0, "rgba(0, 255, 0, 0.2)");
  gradient.addColorStop(1, "rgba(0, 255, 0, 0)");
  c.fillStyle = gradient;
  c.globalAlpha = 0.3 * remainingRatio;
  c.arc(this.x, this.y, this.radius * 1.5, 0, Math.PI * 2);
  c.fill();
  
  c.globalAlpha = 1;
  }

  /**
   * Draws the player onto the canvas.
   * - Displays the username centered below the player.
   * - Draws a circular representation of the player.
   * - Adds a glowing effect to enhance visibility.
   * - Renders a health bar above the player.
   */
  draw({ xPosition = 1.5, yPosition = 10, angle }) {
    // --- Draw Username ---
    c.font = '12px sans-serif'
    c.fillStyle = 'white'
    const textWidth = c.measureText(this.username).width
    const textX = this.x - textWidth / 2
    const textY = this.y + this.radius + 15
    c.fillText(this.username, textX, textY)
  
    // --- Draw Health Bar ---
    const healthBarWidth = 40
    const healthBarHeight = 4
    const healthPercentage = this.health / this.maxHealth
  
    c.fillStyle = 'rgba(255, 255, 255, 0.5)'
    c.fillRect(this.x - healthBarWidth / 2, this.y - this.radius - 10, healthBarWidth, healthBarHeight)
  
    const healthColor = `hsl(${healthPercentage * 120}, 100%, 50%)`
    c.fillStyle = healthColor
    c.fillRect(this.x - healthBarWidth / 2, this.y - this.radius - 10, healthBarWidth * healthPercentage, healthBarHeight)
  
    // 
    // Draw Player's Body
    // 
    c.save()
    c.translate(this.x, this.y)
    c.rotate(angle)
  
    // Body
    c.shadowColor = this.color
    c.shadowBlur = 20
    c.beginPath()
    c.fillStyle = this.color
    c.arc(0, 0, this.radius, 0, Math.PI * 2) // draw from center
    c.fill()
  
    // Draw facing indicator – optional: pointer or "eye"
    c.beginPath()
    c.fillStyle = 'black'
    c.arc(this.radius * 0.7, 0, this.radius * 0.2, 0, Math.PI * 2) // a small "eye" or dot to show direction
    c.fill()
  
    if (this.equippedWeapon?.name === "fist"){
      // Draw hand
      c.beginPath()
      c.fillStyle = this.color
      c.arc(this.radius * xPosition, yPosition, this.radius / 3, 0, Math.PI * 2)
      c.arc(this.radius * xPosition, -yPosition, this.radius / 3, 0, Math.PI * 2)
      c.fill()
    }
  
    if (this.equippedWeapon?.name != "fist" &&
      this.equippedWeapon?.image instanceof HTMLImageElement &&
      this.equippedWeapon?.image.complete){
      const img = this.equippedWeapon.image
      
      c.drawImage(img, (-this.radius * xPosition - img.width / 2) + 15, (-img.height / 2) + 20)
    }

    c.restore()

    this.drawPowerupEffects();
    
  }
}