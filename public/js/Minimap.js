// ------------------------------
// Minimap canvas and context
// ------------------------------
const miniMap = document.querySelector("#miniMapC")
const miniMapCtx = miniMap.getContext("2d")
miniMap.width = 150
miniMap.height = 150


// ------------------------------
// Mini Map
// ------------------------------
function drawOnMiniMap(item, worldWidth = 5000, worldHeight = 5000) {
    const minimapScaleX = miniMap.width / worldWidth
    const minimapScaleY = miniMap.height / worldHeight
  
    const miniX = item.x * minimapScaleX
    const miniY = item.y * minimapScaleY
  
    if (item instanceof Player){
      if (item === frontEndPlayers[socket.id]) {
        miniMapCtx.beginPath();
        miniMapCtx.arc(miniX, miniY, 4, 0, Math.PI * 2);
        miniMapCtx.strokeStyle = "white";
        miniMapCtx.stroke();
        miniMapCtx.closePath();
      }
      miniMapCtx.beginPath()
      miniMapCtx.arc(miniX, miniY, 2, 0, Math.PI * 2)
      miniMapCtx.fillStyle = item.color
      miniMapCtx.fill()
      miniMapCtx.closePath()
    } else if (item instanceof WeaponDrawing){
      miniMapCtx.beginPath()
      miniMapCtx.rect(miniX, miniY, 4, 4)
      miniMapCtx.fillStyle = "yellow";
      miniMapCtx.fill()
      miniMapCtx.closePath()
    } else if (item instanceof PowerUpDrawing){
      miniMapCtx.beginPath();
      miniMapCtx.moveTo(miniX, miniY - 4)
      miniMapCtx.lineTo(miniX - 4, miniY)
      miniMapCtx.lineTo(miniX + 4, miniY)
      miniMapCtx.fillStyle = "green"
      miniMapCtx.fill()
      miniMapCtx.closePath()
    }
}