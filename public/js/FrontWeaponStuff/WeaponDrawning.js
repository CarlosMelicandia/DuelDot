class WeaponDrawing {
    constructor({id, x, y, radius, color, type}) {
        this.id = id
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color // Keep as fallback
        this.type = type
        this.image = new Image()
        
        // Define image paths for each weapon type
        const weaponImages = {
            "pistol": "../assets/FirePistol.png",
            "submachineGun": "../assets/ShotGun.png",
            "sniper": "../assets/sniper.png",
            "shuriken": "../assets/shuriken.png"
        };
        
        // Define size multipliers for each weapon type
        this.sizeMultipliers = {
            "pistol": 2.5,
            "submachineGun": 2.0,
            "sniper": 2.8,
            "shuriken": 1.5
        };
        
        // Changes size of icons when spawning in
        this.sizeMultiplier = this.sizeMultipliers[this.type] || 2;
        
        // Set the image source based on weapon type
        this.image.src = weaponImages[this.type];
        
        // Flag to track if image loaded successfully
        this.imageLoaded = false;
        this.image.onload = () => {
            this.imageLoaded = true;
        };
    }

    draw() {
        if (this.imageLoaded) {
            // Calculate the larger size based on the multiplier
            const displayRadius = this.radius * this.sizeMultiplier;
            
            // Draw the weapon image if it's loaded (larger than the hitbox)
            c.drawImage(
                this.image, 
                this.x - displayRadius, 
                this.y - displayRadius, 
                displayRadius * 2, 
                displayRadius * 2
            );
            
            // Uncomment this to see the actual collision radius (for debugging)
            
            // c.beginPath();
            // c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            // c.strokeStyle = "red";
            // c.stroke();
            // c.closePath();
            
        } else {
            // Fallback to original circle drawing if image isn't loaded
            c.beginPath();
            c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            c.fillStyle = this.color;
            c.fill();
            c.closePath();
        }
    }
}

