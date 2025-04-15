class PowerUpDrawing {
  constructor({ id, x, y, radius, type }) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.type = type;
    this.image = new Image(); // Create an image object
    this.pulseSize = 0; // For the pulse animation
    this.pulseDirection = 1; // 1 for growing, -1 for shrinking
    this.maxPulseSize = 2; // Maximum size the pulse can grow
    this.pulseSpeed = 0.3; // Speed of the pulse animation
    this.rotation = 0; // For rotating effects
    this.particles = []; // For particle effects
    this.particleTimer = 0; // Timer for particle generation

    // Assign different PNGs based on power-up type
    const powerUpImages = {
      "speed": "../assets/powerups/SpeedPU.png",
      "multiShot": "../assets/powerups/MultishotPU.png",
      "health": "../assets/powerups/HealthPU.png",
      "damage": "../assets/powerups/DamagePU.png",
      "shield": "../assets/powerups/ShieldPU.png",
      "rapid": "../assets/powerups/RapidFirePU.png",
      "fire": "../assets/powerups/FirePU.png"
    };

    // Colors for the glow effect based on powerup type
    this.glowColors = {
      "speed": "#FFFF00", // Yellow
      "multiShot": "#FF0000", // Red
      "health": "#00FF00", // Green
      "damage": "#FFA500", // Orange
      "shield": "#4bb3e1", //Blue
      "rapid": "#ff8600", // Orange-ish
      "fire": "#FF4500",  // Orange-Red
    };

    // Animation properties specific to each powerup type
    this.typeConfig = {
      "speed": {
        particleRate: 5,
        particleLifespan: 30,
        rotationSpeed: 0.02,
        pulseSpeed: 0.4,
        glowIntensity: 0.5,
      },
      "multiShot": {
        particleRate: 3,
        particleLifespan: 25,
        rotationSpeed: 0.015,
        pulseSpeed: 0.3,
        glowIntensity: 0.4,
      },
      "health": {
        particleRate: 4,
        particleLifespan: 40,
        rotationSpeed: 0.01,
        pulseSpeed: 0.25,
        glowIntensity: 0.5,
      },
      "damage": {
        particleRate: 3,
        particleLifespan: 20,
        rotationSpeed: 0.03,
        pulseSpeed: 0.4,
        glowIntensity: 0.6,
      },
      "shield": {
        particleRate: 4,
        particleLifespan: 35,
        rotationSpeed: 0.01,
        pulseSpeed: 0.3,
        glowIntensity: 0.5,
      },
      "rapid": {
        particleRate: 5,
        particleLifespan: 15,
        rotationSpeed: 0.04,
        pulseSpeed: 0.5,
        glowIntensity: 0.4,
      },
      "fire": {
        particleRate: 6,
        particleLifespan: 25,
        rotationSpeed: 0.02,
        pulseSpeed: 0.4,
        glowIntensity: 0.6,
      }
    };

    // Apply type-specific configuration
    const config = this.typeConfig[this.type] || this.typeConfig.speed;
    this.particleRate = config.particleRate;
    this.particleLifespan = config.particleLifespan;
    this.rotationSpeed = config.rotationSpeed;
    this.pulseSpeed = config.pulseSpeed;
    this.glowIntensity = config.glowIntensity;

    this.image.src = powerUpImages[this.type] || "../assets/DefaultPU.png";
    
    // Flag to track if image loaded successfully
    this.imageLoaded = false;
    this.image.onload = () => {
        this.imageLoaded = true;
    }
  }

  // Create a particle for the powerup effects
  createParticle() {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * this.radius;
    
    return {
      x: this.x + Math.cos(angle) * distance,
      y: this.y + Math.sin(angle) * distance,
      vx: Math.cos(angle) * 0.5,
      vy: Math.sin(angle) * 0.5,
      radius: Math.random() * 2 + 1,
      alpha: 1,
      life: this.particleLifespan,
      color: this.glowColors[this.type]
    };
  }

  // Update particle positions and properties
  updateParticles() {
    // Generate new particles
    this.particleTimer++;
    if (this.particleTimer >= this.particleRate) {
      this.particles.push(this.createParticle());
      this.particleTimer = 0;
    }

    // Update existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 1 / p.life;
      p.life--;

      // Remove dead particles
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  draw() {
    if (!this.imageLoaded) return;
    
    // Update the pulse animation
    this.pulseSize += this.pulseDirection * this.pulseSpeed;
    if (this.pulseSize >= this.maxPulseSize) {
      this.pulseDirection = -1;
    } else if (this.pulseSize <= 0) {
      this.pulseDirection = 1;
    }

    // Update rotation for the powerup
    this.rotation += this.rotationSpeed;
    if (this.rotation >= Math.PI * 2) {
      this.rotation = 0;
    }

    // Update particles
    this.updateParticles();
    
    // Draw particles
    for (const p of this.particles) {
      c.beginPath();
      c.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      c.fillStyle = p.color;
      c.globalAlpha = p.alpha * 0.7;
      c.fill();
      c.closePath();
    }

    // Draw the glow/pulse effect
    c.save();
    c.beginPath();
    c.arc(this.x, this.y, this.radius + this.pulseSize + 4, 0, Math.PI * 2);
    c.fillStyle = this.glowColors[this.type] || "#FFFF00";
    c.globalAlpha = 0.2 * this.glowIntensity; // Make the glow semi-transparent
    c.fill();
    c.closePath();

    // Draw inner glow
    c.beginPath();
    c.arc(this.x, this.y, this.radius + this.pulseSize, 0, Math.PI * 2);
    c.fillStyle = this.glowColors[this.type] || "#FFFF00";
    c.globalAlpha = 0.4 * this.glowIntensity; // Inner glow is brighter
    c.fill();
    c.closePath();

    // Draw rotating effect (for certain powerups)
    if (["speed", "shield", "rapid", "fire"].includes(this.type)) {
      const orbitRadius = this.radius * 1.2;
      const orbitCount = this.type === "speed" ? 2 : this.type === "shield" ? 4 : 3;
      
      for (let i = 0; i < orbitCount; i++) {
        const orbitAngle = this.rotation + (i * (Math.PI * 2) / orbitCount);
        const orbitX = this.x + Math.cos(orbitAngle) * orbitRadius;
        const orbitY = this.y + Math.sin(orbitAngle) * orbitRadius;
        
        c.beginPath();
        c.arc(orbitX, orbitY, 2, 0, Math.PI * 2);
        c.fillStyle = this.glowColors[this.type];
        c.globalAlpha = 0.8;
        c.fill();
        c.closePath();
      }
    }

    // Draw the powerup image
    c.globalAlpha = 1.0;
    c.drawImage(this.image, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
    c.restore();
  }
}