let currentPage = 1; // Current instruction page

// Update the instruction page when user click next button
document.getElementById("next-btn").addEventListener("click", () => {
  if (currentPage < 3) {
    currentPage++;
    updatePage(currentPage);
  }
});

// Update the instruction page when user click previous button
document.getElementById("prev-btn").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    updatePage(currentPage);
  }
});


// Return to the main menu when the back button is clicked
document.getElementById("back-btn").addEventListener("click", () => {
  window.location.href = "../index.html"; // Redirect to the main menu
});

// Update the instruction page when the user click next or previous button
function updatePage(page) {
  if(page === 1) {
    document.getElementById("instruction-img").src = "../assets/instruction/instruction-one.png";
    document.getElementById("instruction-text").textContent = "Please choose a class and name before starting the game!";
    document.getElementById("instruction-count").textContent = "Page 1/3";
  }else if(page === 2) {
    document.getElementById("instruction-img").src = "../assets/instruction/instruction-two.png";
    document.getElementById("instruction-text").textContent = "W,A,S,D: Movement" + "    1: Item Slot 1\n" + "F: Pick up guns" + "      2: Item Slot 2\n"+ "      Q: Drop Weapons" + "   Left-Click: Shoot/Punch";
    document.getElementById("instruction-count").textContent = "Page 2/3";
  }else if(page === 3) {
    document.getElementById("instruction-img").src = "../assets/instruction/instruction-three.png";
    document.getElementById("instruction-text").textContent = "Enjoy an emerging battle royale experience with your friends!";
    document.getElementById("instruction-count").textContent = "Page 3/3";
  }
}