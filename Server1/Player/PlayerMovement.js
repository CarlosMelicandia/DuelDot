/**
   * Handles player movement via key presses.
   */

function playerMovement(socket, backEndPlayers, gameWidth, gameHeight){
    socket.on("keydown", ({ keycode, sequenceNumber }) => {
        const backEndPlayer = backEndPlayers[socket.id]; // Assigns backEndPlayer with the player's current info

        if (!backEndPlayer) return; // Ensure player exists before proceeding

        backEndPlayer.sequenceNumber = sequenceNumber; // Sync the sequence number from the client

        // Move the player based on the key pressed
        switch (keycode) {
        case "KeyW":
            backEndPlayers[socket.id].y -= 5 * backEndPlayer.speed;
            break;
        case "KeyA":
            backEndPlayers[socket.id].x -= 5 * backEndPlayer.speed;
            break;
        case "KeyS":
            backEndPlayers[socket.id].y += 5 * backEndPlayer.speed;
            break;
        case "KeyD":
            backEndPlayers[socket.id].x += 5 * backEndPlayer.speed;
            break;
        }

        // Prevent the player from moving out of bounds
        const playerSides = {
        left: backEndPlayer.x - backEndPlayer.radius,
        right: backEndPlayer.x + backEndPlayer.radius,
        top: backEndPlayer.y - backEndPlayer.radius,
        bottom: backEndPlayer.y + backEndPlayer.radius,
        };

        if (playerSides.left < 0)
        backEndPlayers[socket.id].x = backEndPlayer.radius;
        if (playerSides.right > gameWidth)
        backEndPlayers[socket.id].x = gameWidth - backEndPlayer.radius;
        if (playerSides.top < 0) backEndPlayers[socket.id].y = backEndPlayer.radius;
        if (playerSides.bottom > gameHeight)
        backEndPlayers[socket.id].y = gameHeight - backEndPlayer.radius;
    });
}

module.exports = { playerMovement }