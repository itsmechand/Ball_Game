// Game elements
const character = document.getElementById("character");
const game = document.getElementById("game");
const scoreElement = document.getElementById("score");
const startButton = document.getElementById("start-btn");

// Game state
let gameInterval;
let blockInterval;
let isGameRunning = false;
let score = 0;
let both = 0;
let counter = 0;
let currentBlocks = [];
let characterSpeed = 2;
let blockSpeed = 0.4;
let dropSpeed = 2;

// Get game dimensions
function getGameDimensions() {
    const gameWidth = parseInt(window.getComputedStyle(game).getPropertyValue("width"));
    const gameHeight = parseInt(window.getComputedStyle(game).getPropertyValue("height"));
    return { gameWidth, gameHeight };
}

// Initialize game
function initGame() {
    const { gameWidth, gameHeight } = getGameDimensions();
    character.style.top = (gameHeight - 40) + "px";
    character.style.left = (gameWidth / 2 - 10) + "px";
    score = 0;
    counter = 0;
    currentBlocks = [];
    updateScore();
    clearGameArea();
}

// Clear game area
function clearGameArea() {
    const blocks = document.querySelectorAll('.block, .hole');
    blocks.forEach(block => block.remove());
    game.appendChild(character);
}

// Update score display
function updateScore() {
    scoreElement.textContent = score;
}

// Movement functions
function moveLeft() {
    const left = parseInt(window.getComputedStyle(character).getPropertyValue("left"));
    if (left > 0) {
        character.style.left = (left - characterSpeed) + "px";
    }
}

function moveRight() {
    const left = parseInt(window.getComputedStyle(character).getPropertyValue("left"));
    const { gameWidth } = getGameDimensions();
    if (left < gameWidth - 20) {
        character.style.left = (left + characterSpeed) + "px";
    }
}

// Keyboard controls
document.addEventListener("keydown", event => {
    if (!isGameRunning) return;

    if (both === 0) {
        both++;
        if (event.key === "ArrowLeft") {
            gameInterval = setInterval(moveLeft, 1);
        }
        if (event.key === "ArrowRight") {
            gameInterval = setInterval(moveRight, 1);
        }
    }
});

document.addEventListener("keyup", event => {
    clearInterval(gameInterval);
    both = 0;
});

// Get hole position for varied pattern
function getHolePosition(gameWidth) {
    const holeWidth = 100;
    const maxPosition = gameWidth - holeWidth;

    // Create a more varied pattern with 8 different positions
    const pattern = counter % 8;

    switch (pattern) {
        case 0: // Far left
            return 0;
        case 1: // Far right
            return maxPosition;
        case 2: // Center
            return maxPosition * 0.5;
        case 3: // Left-center
            return maxPosition * 0.25;
        case 4: // Right-center
            return maxPosition * 0.75;
        case 5: // Two small gaps (double hole)
            if (Math.random() > 0.5) {
                return maxPosition * 0.2;
            } else {
                return maxPosition * 0.8;
            }
        case 6: // Random position
            return Math.random() * maxPosition;
        case 7: // Alternating sides
            return counter % 2 === 0 ? 0 : maxPosition;
        default:
            return 0;
    }
}

// Create blocks and holes
function createBlock() {
    const block = document.createElement("div");
    const hole = document.createElement("div");
    block.setAttribute("class", "block");
    hole.setAttribute("class", "hole");
    block.setAttribute("id", "block" + counter);
    hole.setAttribute("id", "hole" + counter);

    const blockLast = document.getElementById("block" + (counter - 1));

    let blockTop;
    if (counter > 0 && blockLast) {
        blockTop = parseInt(window.getComputedStyle(blockLast).getPropertyValue("top"));
    } else {
        const { gameHeight } = getGameDimensions();
        blockTop = gameHeight - 100;
    }

    // Vary the spacing between lines slightly
    const spacing = Math.random() * 20 + 70; // Random spacing between 70px and 90px
    block.style.top = (blockTop + spacing) + "px";
    hole.style.top = (blockTop + spacing) + "px";

    const { gameWidth } = getGameDimensions();
    const holePosition = getHolePosition(gameWidth);
    hole.style.left = holePosition + "px";

    game.appendChild(block);
    game.appendChild(hole);
    currentBlocks.push(counter);
    counter++;
}

// Game loop
function gameLoop() {
    if (!isGameRunning) return;

    const characterTop = parseInt(window.getComputedStyle(character).getPropertyValue("top"));
    const characterLeft = parseInt(window.getComputedStyle(character).getPropertyValue("left"));
    const { gameHeight } = getGameDimensions();
    let drop = 0;

    // Check game over condition
    if (characterTop <= 0) {
        endGame();
        return;
    }

    // Update blocks and check collisions
    for (let i = 0; i < currentBlocks.length; i++) {
        const current = currentBlocks[i];
        const iblock = document.getElementById("block" + current);
        const ihole = document.getElementById("hole" + current);

        if (!iblock || !ihole) continue;

        let iblockTop = parseFloat(window.getComputedStyle(iblock).getPropertyValue("top"));
        let iholeLeft = parseFloat(window.getComputedStyle(ihole).getPropertyValue("left"));

        iblock.style.top = (iblockTop - blockSpeed) + "px";
        ihole.style.top = (iblockTop - blockSpeed) + "px";

        // Remove blocks that are out of view and create new ones to maintain pattern
        if (iblockTop < -20) {
            currentBlocks.shift();
            iblock.remove();
            ihole.remove();
            score++;
            updateScore();
            // Create a new block immediately when one is removed
            createBlock();
        }

        // Check collision with blocks
        if (iblockTop - 20 < characterTop && iblockTop > characterTop) {
            drop++;
            if (iholeLeft <= characterLeft && iholeLeft + 100 >= characterLeft) {
                drop = 0;
            }
        }
    }

    // Apply gravity
    if (drop === 0) {
        if (characterTop < gameHeight - 20) {
            character.style.top = (characterTop + dropSpeed) + "px";
        }
    } else {
        character.style.top = (characterTop - blockSpeed) + "px";
    }
}

// Start game
function startGame() {
    // Clear any existing intervals first
    if (isGameRunning) {
        clearInterval(blockInterval);
        clearInterval(gameInterval);
    }

    isGameRunning = true;
    startButton.textContent = "Restart Game";
    initGame();

    // Create initial blocks with proper spacing
    const { gameHeight } = getGameDimensions();
    const blockCount = Math.floor(gameHeight / 80) + 2;

    for (let i = 0; i < blockCount; i++) {
        createBlock();
    }

    // Continuous block creation with moderate interval
    blockInterval = setInterval(createBlock, 1800);
    gameInterval = setInterval(gameLoop, 1);
}

// End game
function endGame() {
    isGameRunning = false;
    clearInterval(blockInterval);
    clearInterval(gameInterval);
    alert(`Game Over! Your score: ${score}`);
    startButton.textContent = "Start Game";

    // Reset game state
    score = 0;
    counter = 0;
    currentBlocks = [];
    updateScore();
}

// Handle window resize
window.addEventListener("resize", () => {
    if (isGameRunning) {
        const { gameWidth, gameHeight } = getGameDimensions();
        character.style.left = Math.min(parseInt(character.style.left), gameWidth - 20) + "px";
        character.style.top = Math.min(parseInt(character.style.top), gameHeight - 20) + "px";
    }
});

// Event listeners
startButton.addEventListener("click", startGame);

// Initialize game on load
window.addEventListener("load", () => {
    initGame();
});
