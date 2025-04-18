const playerNames = [
  "Shadow",
  "Raven",
  "Phoenix",
  "Blaze",
  "Viper",
  "Maverick",
  "Rogue",
  "Hunter",
  "Nova",
  "Zephyr",
  "Falcon",
  "Titan",
  "Specter",
  "Cyclone",
  "Inferno",
  "Reaper",
  "Stalker",
  "Venom",
  "Glitch",
  "Banshee",
  "Shadowstrike",
  "Onyx",
  "Rebel",
  "Fury",
  "Apex",
  "Crimson",
  "Nightfall",
  "Saber",
  "Tempest",
  "Lightning",
  "Bullet",
  "Vortex",
  "Echo",
  "Blitz",
  "Rift",
  "BOB",
];

  tankStats = [
  (150 / 150) * 10, // health
  (17 / 20) * 10, // radius
  (0.7 / 2.0) * 10, // speed
];
  rogueStats = [
  (80 / 150) * 10, // health
  (9 / 20) * 10, // radius
  (1.4 / 2.0) * 10, // speed
];
 mageStats = [
  (120 / 150) * 10, // health
  (12 / 20) * 10, // radius
  (1 / 2.0) * 10, // speed
];
 gunnerStats = [
  (100 / 150) * 10, // health
  (14 / 20) * 10, // radius
  (1.2 / 2.0) * 10, // speed
];

let className = ""; // Variable to store the selected class name
let radarChart = null; // Use this variable to check if chart already exists
let nameReady = false; // Flag to check if the player has selected a name
let classReady = false; // Flag to check if the player has selected a class
// ------------------------------
// Username Form Handling
// ------------------------------
/**
 * When the player submits their username (or chosen random name):
 * - Prevent default form submission
 * - Hide the username form
 * - Emit an 'initGame' event to the server with our chosen data
 */

function selectName() {
  let playerNameNumber = Math.floor(Math.random() * playerNames.length);
  let name = playerNames[playerNameNumber];
  for (const id in frontEndPlayers) {
    if (frontEndPlayers[id] === name) {
      // If name is already taken by a current player, try again
      return selectName();
    }
  }
  return name;
}

let playerName = selectName(); // Select a random name from the list

document.querySelector("#random-btn").addEventListener("click", () => {
  // Generate a new random name when clicked
  playerName = selectName();
  document.querySelector("#name-box").textContent = playerName;
  nameReady = true; // Set the nameReady flag to true
});

// ------------------------------
// Class Selection Handling
// ------------------------------
document.getElementById("tank-class").addEventListener("click", () => {
  document.querySelector(".stat-display").style.display = "block";
  drawRadarChart("Tank", tankStats, "red");
  classReady = true; // Set the classReady flag to true
  className = "Tank"; // Store the selected class name
});
document.getElementById("rogue-class").addEventListener("click", () => {
  document.querySelector(".stat-display").style.display = "block";
  drawRadarChart("Rogue", rogueStats, "blue");
  classReady = true; // Set the classReady flag to true
  className = "Rogue"; // Store the selected class name
});
document.getElementById("mage-class").addEventListener("click", () => {
  document.querySelector(".stat-display").style.display = "block";
  drawRadarChart("Mage", mageStats, "purple");
  classReady = true; // Set the classReady flag to true
  className = "Mage"; // Store the selected class name
});
document.getElementById("gunner-class").addEventListener("click", () => {
  document.querySelector(".stat-display").style.display = "block";
  drawRadarChart("Gunner", gunnerStats, "gray");
  classReady = true; // Set the classReady flag to true
  className = "Gunner"; // Store the selected class name
});

// ------------------------------
// Statistic Display Handling
// ------------------------------
function drawRadarChart(label, stats, color) {
  document.getElementById("stat-title").textContent = label;
  document.getElementById("stat-title").style.color = color;
  const ctx = document.getElementById("stat-chart").getContext("2d");

  if (radarChart) {
    radarChart.destroy(); // Destroy the previous chart if it exists
  }

  radarChart = new Chart(ctx, {
    type: "radar",
    data: {
      labels: ["Health", "Radius", "Speed"],
      datasets: [
        {
          label: label,
          data: stats,
          backgroundColor: "rgba(255, 99, 132, 0.2)", // Change per class
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 2,
          pointBackgroundColor: "white",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          suggestedMin: 0,
          suggestedMax: 10,
          ticks: {
            stepSize: 2,
            backdropColor: "transparent",
            color: "#fff",
          },
          pointLabels: {
            color: "#fff",
            font: {
              size: 14,
            },
          },
          grid: {
            color: "rgba(255, 255, 255, 0.3)",
          },
          angleLines: {
            color: "rgba(255, 255, 255, 0.3)",
          },
        },
      },
      plugins: {
        legend: { display: false },
      },
    },
  });
}

// ------------------------------
// Start Game Handling
// ------------------------------
document.getElementById("submit-btn").addEventListener("click", (event) => {
  event.preventDefault(); // Prevents the form from refreshing
  if (!nameReady || !classReady) {
    document.getElementById("warning-message").style.display = "block"; // Show the start menu again
    document.getElementById("warning-message").textContent =
      "Please select a class and name before starting the game!";
    document.getElementById("warning-message").style.color = "red"; // Set warning message color to red
    return;
  }

  gameStarted = true; // Set the gameStarted flag to true

  document.querySelector("#start-page").style.display = "none"; // Hide the start menu
  document.querySelector(".displayAfter").style.display = "block"; // Show the game page

  animate(); // Start the game animation

  // Send data to the server to initialize the player
  socket.emit("initGame", {
    width: canvas.width,
    height: canvas.height,
    devicePixelRatio,
    username: playerName,
    className,
  });
  const powerUpBar = document.getElementById("powerUpStatus")
  if (className === "Gunner") {
    document.querySelector("#inventorySlot3").style.display = "flex";
    const inventory = document.querySelector("#inventoryArea");
    const currentBottom = parseInt(
      window.getComputedStyle(inventory).bottom,
      10
    ); // Get numeric bottom
    inventory.style.bottom = currentBottom + "px";
    
    const currentHeight = parseInt(
      window.getComputedStyle(inventory).height,
      10
    ); // Get numeric bottom
    const newHeight = currentHeight + 70;
    inventory.style.height = newHeight + "px";

    
    const currentPUBottom = parseInt(
      window.getComputedStyle(powerUpBar).height,
      10 ); // Get numeric bottom
    const newPU = currentPUBottom + 70;
    powerUpBar.style.bottom = newHeight + "px";
  } else {
    document.querySelector("#inventorySlot3").style.display = "none";
    // document.querySelector("#inventoryArea").style.height = "156px"; // reset height for other classes
    // powerUpBar.style.bottom = '165px';
  }
});

// ------------------------------
// Back Button Handling
// ------------------------------
document.getElementById("back-btn").addEventListener("click", () => {
  window.location.href = "../index.html"; // Redirect to the main menu
});
