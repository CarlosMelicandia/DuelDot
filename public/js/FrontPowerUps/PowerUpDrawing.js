// Make sure PowerUpDrawing is only defined once
if (typeof PowerUpDrawing === 'undefined') {
  class PowerUpDrawing {
    constructor({ id, x, y, radius, type }) {
      this.id = id;
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.type = type;
      this.image = new Image();
      this.pulseSize = 0;
      this.pulseDirection = 1;
      this.maxPulseSize = 3;
      this.pulseSpeed = 0.2;
      this.rotation = 0;
      this.particles = [];
      this.particleTimer = 0;

      this.image.src = PowerUpDrawing.powerUpImages[this.type] || "../assets/DefaultPU.png";
      
      this.imageLoaded = false;
      this.image.onload = () => {
          this.imageLoaded = true;
      }

      // Apply type-specific configuration
      const baseConfig = PowerUpDrawing.typeConfig[this.type] || PowerUpDrawing.typeConfig.speed;
      this.particleRate = Math.max(2, baseConfig.particleRate - 1);
      this.particleLifespan = baseConfig.particleLifespan * 1.5;
      this.rotationSpeed = baseConfig.rotationSpeed * 1.2;
      this.pulseSpeed = baseConfig.pulseSpeed * 0.8;
      this.glowIntensity = baseConfig.glowIntensity * 1.3;
    }

    // Static properties
    static powerUpImages = {
      "speed": "../assets/powerups/SpeedPU.png",
      "multiShot": "../assets/powerups/MultishotPU.png",
      "health": "../assets/powerups/HealthPU.png",
      "damage": "../assets/powerups/DamagePU.png",
      "shield": "../assets/powerups/ShieldPU.png",
      "rapid": "../assets/powerups/RapidFirePU.png",
      "fire": "../assets/powerups/FirePU.png"
    };

    static glowColors = {
      "speed": "#FFFF00", // Yellow
      "multiShot": "#FF0000", // Red
      "health": "#00FF00", // Green
      "damage": "#FFA500", // Orange
      "shield": "#4bb3e1", // Blue
      "rapid": "#ff8600", // Orange-ish
      "fire": "#FF4500"  // Orange-Red
    };

    static typeConfig = {
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
        color: PowerUpDrawing.glowColors[this.type]
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
      c.fillStyle = PowerUpDrawing.glowColors[this.type] || "#FFFF00";
      c.globalAlpha = 0.2 * this.glowIntensity; // Make the glow semi-transparent
      c.fill();
      c.closePath();

      // Draw inner glow
      c.beginPath();
      c.arc(this.x, this.y, this.radius + this.pulseSize, 0, Math.PI * 2);
      c.fillStyle = PowerUpDrawing.glowColors[this.type] || "#FFFF00";
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
          c.fillStyle = PowerUpDrawing.glowColors[this.type];
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

    // Add these new methods for status display
    static setupStatusDisplay() {
      // Create status display container
      const statusBox = document.createElement('div');
      statusBox.id = 'powerUpStatus';
      statusBox.style.position = 'absolute';
      statusBox.style.display = 'flex';
      statusBox.style.gap = '10px';
      statusBox.style.padding = '5px';
      statusBox.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
      statusBox.style.borderRadius = '8px';
      statusBox.style.zIndex = '1000';
      statusBox.style.bottom = '142px';
      statusBox.style.left = '910px';
      statusBox.style.transform = 'translate(-50%, 0)';
      statusBox.style.width = '230px';
      statusBox.style.justifyContent = 'center';

      const gameContainer = document.querySelector('div[style*="position: relative"]');
      gameContainer.appendChild(statusBox);

      // Store active power-ups
      PowerUpDrawing.activePowerUps = new Map();
      PowerUpDrawing.statusContainer = statusBox;
    }

    static addActiveStatus(type, duration) {
      // Remove oldest if we have 3 power-ups
      if (PowerUpDrawing.activePowerUps.size >= 3) {
        let oldestType;
        let oldestTime = Infinity;
        
        PowerUpDrawing.activePowerUps.forEach((data, powerType) => {
          if (data.endTime < oldestTime) {
            oldestTime = data.endTime;
            oldestType = powerType;
          }
        });
        
        if (oldestType) {
          const oldPowerUp = PowerUpDrawing.activePowerUps.get(oldestType);
          oldPowerUp.element.remove();
          PowerUpDrawing.activePowerUps.delete(oldestType);
        }
      }

      // Create power-up icon with timer
      const powerUpBox = document.createElement('div');
      powerUpBox.style.position = 'relative';
      powerUpBox.style.width = '40px';
      powerUpBox.style.height = '40px';
      powerUpBox.style.filter = `drop-shadow(0 0 4px ${PowerUpDrawing.glowColors[type]})`;
      powerUpBox.style.transition = 'filter 0.3s ease';

      // Add power-up image
      const img = document.createElement('img');
      img.src = PowerUpDrawing.powerUpImages[type];
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.borderRadius = '5px';
      powerUpBox.appendChild(img);

      // Add timer circle
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 36 36');
      svg.style.position = 'absolute';
      svg.style.top = '0';
      svg.style.left = '0';
      svg.style.width = '100%';
      svg.style.height = '100%';
      svg.style.transform = 'rotate(-90deg)';

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '18');
      circle.setAttribute('cy', '18');
      circle.setAttribute('r', '16');
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', PowerUpDrawing.glowColors[type]);
      circle.setAttribute('stroke-width', '3');
      circle.setAttribute('stroke-dasharray', '100 100');
      circle.setAttribute('stroke-linecap', 'round');
      
      svg.appendChild(circle);
      powerUpBox.appendChild(svg);

      // Add hover effect
      powerUpBox.addEventListener('mouseenter', () => {
        powerUpBox.style.filter = `drop-shadow(0 0 8px ${PowerUpDrawing.glowColors[type]})`;
      });
      powerUpBox.addEventListener('mouseleave', () => {
        powerUpBox.style.filter = `drop-shadow(0 0 4px ${PowerUpDrawing.glowColors[type]})`;
      });

      PowerUpDrawing.statusContainer.appendChild(powerUpBox);

      // Save power-up info
      PowerUpDrawing.activePowerUps.set(type, {
        element: powerUpBox,
        circle: circle,
        duration: duration,
        endTime: Date.now() + duration
      });
    }

    static updateActiveStatuses() {
      const now = Date.now();
      
      PowerUpDrawing.activePowerUps.forEach((powerUp, type) => {
        const timeLeft = powerUp.endTime - now;
        
        if (timeLeft <= 0) {
          // Fade out animation
          powerUp.element.style.opacity = '0';
          powerUp.element.style.transform = 'scale(0.8)';
          setTimeout(() => {
            powerUp.element.remove();
            PowerUpDrawing.activePowerUps.delete(type);
          }, 300);
        } else {
          // Update timer circle
          const progress = (timeLeft / powerUp.duration) * 100;
          powerUp.circle.setAttribute('stroke-dasharray', `${progress} 100`);
          
          // Make glow stronger when almost expired
          if (progress < 20) {
            const glowSize = 4 + ((20 - progress) / 20) * 4;
            powerUp.element.style.filter = `drop-shadow(0 0 ${glowSize}px ${PowerUpDrawing.glowColors[type]})`;
          }
        }
      });
    }
  }

  // Initialize the status display when the document is ready
  document.addEventListener('DOMContentLoaded', () => {
    PowerUpDrawing.setupStatusDisplay();
  });

  // Make PowerUpDrawing available globally
  window.PowerUpDrawing = PowerUpDrawing;
}