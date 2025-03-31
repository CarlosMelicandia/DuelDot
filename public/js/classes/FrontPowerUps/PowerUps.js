class PowerUps {
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
  
  
      // Assign different PNGs based on power-up type
      const powerUpImages = {
        "speed": "../assets/speed.png", 
        "multiShot": "../assets/MultishotPU.png",
        "health": "../assets/HealthPU.png",
        "damage": "../assets/DamagePU.png",
        "shield": "../assets/ShieldPU.png"
      };
  
      // Colors for the glow effect based on powerup type
      this.glowColors = {
        "speed": "#FFFF00", // Yellow
        "multiShot": "#FF0000", // Red
        "health": "#00FF00", // Green
        "damage": "#FFA500", // Orange
        "shield": "#0000FF", // Blue
      };
  
      this.image.src = powerUpImages[this.type] || "../assets/speed.png";
  
    }
  
    draw() {
      // Update the pulse animation
      this.pulseSize += this.pulseDirection * this.pulseSpeed;
      if (this.pulseSize >= this.maxPulseSize) {
        this.pulseDirection = -1;
      } else if (this.pulseSize <= 0) {
        this.pulseDirection = 1;
      }
  
      // Draw the glow/pulse effect
      c.save();
      c.beginPath();
      c.arc(this.x, this.y, this.radius + this.pulseSize, 0, Math.PI * 2);
      c.fillStyle = this.glowColors[this.type] || "#FFFF00";
      c.globalAlpha = 0.3; // Make the glow semi-transparent
      c.fill();
      c.closePath();
      c.restore();
      
      c.drawImage(this.image, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
    }
  }