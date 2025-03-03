class WeaponDrawing {
    constructor(x, y, width, height, color){
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.color = color
    }

    draw() {
        c.beginPath()
        c.fillRect(this.x, this.y, this.height, this.width)
        c.fill()
    }

    update() {
        this.draw()
    }
}