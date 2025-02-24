function tankSelected(){
    player = new Tank(x, y);
    finalizeSelection()
}

function mageSelected(){
    player = new Mage(x, y);
    finalizeSelection()
}

function rougeSelected(){
    player = new Rouge(x, y);
    finalizeSelection()
}

function playerSelected(){
    player = new Player(x, y);
    finalizeSelection()
}

function gunnerSelected(){
    player = new Gunner(x, y);
    finalizeSelection()
}

function samuraiSelected(){
    player = new Gunner(x, y);
    finalizeSelection()
}

// This function finalizes the selection by updating UI, removing buttons, and starting animation
function finalizeSelection() {
    healthEl.innerHTML = player.health; // Update health 
    speedEl.innerHTML = player.speed; // Update Speed
    // Remove all selection buttons
    document.querySelectorAll(".buttonToRemove").forEach(button => button.remove());

    // Once a class is selected it starts the game 
    animate()
    spawnEnemies()
    spawnUpgradeOrbs()
}