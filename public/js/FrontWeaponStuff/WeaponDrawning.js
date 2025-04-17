class WeaponDrawing {
    constructor({id, x, y, radius, name, type, isReloaded, fireRate}) {
        this.id = id
        this.x = x
        this.y = y
        this.radius = radius
        this.name = name
        this.type = type
        this.isReloaded = isReloaded
        this.fireRate = fireRate * 1000
        this.image = new Image()
        this.topImage = new Image()
        this.reloadStartTime = 0

        // Define image paths for each weapon type
        const weaponImages = {
            "pistol": "../assets/weapons/Pistol.png",
            "submachineGun": "../assets/weapons/SubmachineGun.png",
            "sniper": "../assets/weapons/Sniper.png",
            "shuriken": "../assets/weapons/Shuriken.png",
            "fist": ""
        };

        const topWeaponImages = {
            "pistol": "../assets/topDownWeapons/pistolTop.png",
            "submachineGun": "../assets/topDownWeapons/subgunTop.png",
            "sniper": "../assets/topDownWeapons/sniperTop.png",
            "shuriken": "../assets/topDownWeapons/shurikenTop.png",
            "fist": ""
        }
        
        // Define size multipliers for each weapon type
        const sizeMultipliers = {
            "pistol": 2.5,
            "submachineGun": 2.0,
            "sniper": 2.8,
            "shuriken": 1.5
        };
        
        // Changes size of icons when spawning in
        this.sizeMultiplier = sizeMultipliers[this.name] || 2;
        
        // Set the image source based on weapon type
        this.image.src = weaponImages[this.name] // || "../assets/weapons/default.png"
        this.topImage.src = topWeaponImages[this.name] // || "../assets/weapons/default.png"
        this.topImageLength = 0
        
        // Flag to track if image loaded successfully
        this.imageLoaded = false;
        this.image.onload = () => {
            this.topImageLength = this.topImage.width * .10
            this.imageLoaded = true;
        }
    }

    draw() {
        if (this.imageLoaded) {
            // Calculate the larger size based on the multiplier
            const displayRadius = this.radius * this.sizeMultiplier;
            
            // Draw the weapon image if it's loaded (larger than the hit box)
            c.drawImage(
                this.image, 
                this.x - this.radius, 
                this.y - this.radius, 
                displayRadius, 
                displayRadius 
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
            c.fill();
            c.closePath();
        }
    }

    drawReloadTimer() {
        if (this.reloadStartTime === null) return;
        const now = performance.now()
        const elapsed = now - this.reloadStartTime
        const progress = Math.min(elapsed / this.fireRate, 1)
       
        const rect1 = document.getElementById('inventorySlot1').getBoundingClientRect()
        const inventory1Width = rect1.width
        const inventory1Height = rect1.height
        const inventory1X = rect1.left;   
        const inventory1Y = rect1.top;
        
        const rect2 = document.getElementById('inventorySlot2').getBoundingClientRect()
        const inventory2Width = rect2.width
        const inventory2Height = rect2.height
        const inventory2X = rect2.left;   
        const inventory2Y = rect2.top;

        c.fillStyle = "red"
        
      }
      
}



