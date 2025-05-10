
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const flipButton = document.getElementById('flipButton');
const stepButton = document.getElementById('stepButton');
const scoreDisplay = document.getElementById('score');
const timeLeftDisplay = document.getElementById('timeLeft');
const messageDisplay = document.getElementById('message');
const timerBar = document.getElementById("timer-bar");
const restartGameButton = document.getElementById("restartGameButton");
const restartGameDisplay = document.getElementById("gameTryAgain");
const stepLeftButton = document.getElementById("stepleft");
const stepRightButton = document.getElementById("stepright");

const PLATFORM_WIDTH = 70;
const PLATFORM_HEIGHT = 10;
const PLAYER_SIZE = 40;
const STEP_HEIGHT = 50;
const PLATFORM_OFFSET = 70; // Distance between middle points of platforms
const TIME_LIMIT = 3; // Seconds per step
let timeLeft = TIME_LIMIT;
let newTimeLimit = TIME_LIMIT;

let playerX = canvas.width / 2;
let playerY = canvas.height - 50;
let facingRight = true;
let platformDir = [];
let platformPos = [{ x: playerX - PLATFORM_WIDTH / 2, y: playerY + 10 }];
let score = 0;
let gameOver = false;
let timer;

// Initialize game
function init() {
    generateInitialPlatforms();
    calculatePlatformPositions();
    draw();
    startTimer();
}

// Generate all platforms up until the top of the screen
function generateInitialPlatforms() {
    // Calculate number of platforms using step height
    const numPlatforms = (canvas.height - 50) / STEP_HEIGHT;
    for (let i = 0; i < numPlatforms; i++) {
        let direction = Math.random() < 0.5 ? -1 : 1;
        platformDir.push(direction);
    }
    console.log(platformDir);
}

// Since platforms will move instead of the player, platforms need to be recalculated at every step.
// However, the number of platforms are small so the cost is trivial
function calculatePlatformPositions() {
    // First platform is always under the player
    platformPos = [{ x: playerX - PLATFORM_WIDTH / 2, y: playerY + 20 }];
    let currX = platformPos[0].x;
    let currY = platformPos[0].y;
    for (let i = 0; i < platformDir.length; i++) {
        currX += PLATFORM_OFFSET * platformDir[i];
        currY -= STEP_HEIGHT;
        platformPos.push({ x: currX, y: currY });
    }
    console.log(platformPos);
}

// Generate next platform (random left or right)
function generateNextPlatform() {
    const direction = Math.random() < 0.5 ? -1 : 1; // -1 = left, 1 = right
    platformDir.push(direction);
}

// Flip player direction
flipButton.addEventListener('click', () => {
    if (!gameOver) {
        facingRight = !facingRight;
        draw();
    }
});

// Step up
stepButton.addEventListener('click', () => {
    if (!gameOver) {
        tryStep();
    }
});

restartGameButton.addEventListener('click', () => {
    restartGame();
});

stepLeftButton.addEventListener('click', () => {
    if (!gameOver) {
        facingRight = false;
        tryStep();
    }
});

stepRightButton.addEventListener('click', () => {
    if (!gameOver) {
        facingRight = true;
        tryStep();
    }
});

// Keyboard support (Space = Step, F = Flip)
document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyR') restartGame();
    if (gameOver) return;
    if (e.code === 'Space' || e.code === 'KeyM') tryStep();
    if (e.code === 'KeyF' || e.code === 'KeyN') facingRight = !facingRight;
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        facingRight = false;
        tryStep();
    }
    if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        facingRight = true;
        tryStep();
    }
    draw();
});

// Attempt to step up
function tryStep() {
    const stepDirection = facingRight ? 1 : -1;

    // Check if step is valid
    if (stepDirection == platformDir[0]) {
        // Success
        score++;
        scoreDisplay.textContent = score;
        
        platformDir.shift();
        generateNextPlatform();
        calculatePlatformPositions();

        resetTimer();
    } else {
        // Fall
        endGame();
    }
    draw();
}

// Timer functions
function startTimer() {
    timer = setInterval(() => {
        if (score)
            timeLeft -= 0.1;

        timeLeftDisplay.textContent = timeLeft.toFixed(1);
        if (timeLeft <= 0) {
            timeLeft = 0;
            timeLeftDisplay.textContent = 0;
            endGame();
        }
    }, 100);
}

function endGame() {
    gameOver = true;
    messageDisplay.textContent = "Game Over";
    clearInterval(timer);
    clearInterval(updateTimer);
    draw();
    restartGameDisplay.style.display = 'block';
}

function restartGame() {
    restartGameDisplay.style.display = 'none';
    console.log("restart game");
    playerX = canvas.width / 2;
    playerY = canvas.height - 50;
    facingRight = true;
    platforms = [{ x: playerX - PLATFORM_WIDTH / 2, y: playerY + 20 }];
    score = 0;
    scoreDisplay.textContent = score;
    gameOver = false;
    messageDisplay.textContent = '';
    newTimeLimit = TIME_LIMIT;
    resetTimer();
    generateNextPlatform();
    draw();
}

// Update timer graphic based on time left
function updateTimer() {
    const percentageLeft = (timeLeft / newTimeLimit) * 100;
    timerBar.style.width = `${percentageLeft}%`;
    if (percentageLeft < 30) {
        timerBar.style.backgroundColor = "#f44336";
    } else if (percentageLeft < 60) {
        timerBar.style.backgroundColor = "#FFC107";
    } else {
        timerBar.style.backgroundColor = "#4CAF50";
    }
}

function resetTimer() {
    clearInterval(timer);
    clearInterval(updateTimer);
    if (newTimeLimit > .5) {
        newTimeLimit -= .01;
    }
    timeLeft = newTimeLimit;
    timeLeftDisplay.textContent = timeLeft.toFixed(1);
    startTimer();
    setInterval(updateTimer, 10);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw platforms based on direction
    ctx.fillStyle = '#777';
    platformPos.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, PLATFORM_WIDTH, PLATFORM_HEIGHT);
    });

    ctx.beginPath();
    if (facingRight) {
        ctx.moveTo(playerX - PLAYER_SIZE / 2 + 5, playerY - PLAYER_SIZE / 2);
        ctx.lineTo(playerX - PLAYER_SIZE / 2 + 5, playerY + PLAYER_SIZE / 2);
        ctx.lineTo(playerX + PLAYER_SIZE / 2, playerY);
    } else {
        ctx.moveTo(playerX + PLAYER_SIZE / 2 - 5, playerY + PLAYER_SIZE / 2);
        ctx.lineTo(playerX + PLAYER_SIZE / 2 - 5, playerY - PLAYER_SIZE / 2);
        ctx.lineTo(playerX - PLAYER_SIZE / 2, playerY);
    }
    ctx.closePath();

    ctx.fillStyle = "blue";
    ctx.fill();

    // Game over overlay
    if (gameOver) {
        /*ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '30px Verdana, arial, helvetica, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Click or press \'R\' to restart', canvas.width / 2, canvas.height / 2);
        */
       
    }
}


canvas.addEventListener('click', () => {
    if (gameOver) {
    }
});

init();