// ============ FLAPPY BIRD GAME WITH EASY/HARD MODES ============
// Easy mode = wider pipe gap (165px) | Hard mode = narrow gap (118px)

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = 400, H = 600;

// ============ CHECK LOGIN ============
if (sessionStorage.getItem('loggedIn') !== 'true') {
    window.location.href = 'login.html';
}

// Display username
const username = sessionStorage.getItem('username') || 'PILOT';
document.getElementById('userBadge').innerHTML = `👤 ${username.toUpperCase()}`;

// ============ DIFFICULTY SETTINGS ============
const EASY_GAP = 165;   // Wide gap
const HARD_GAP = 118;   // Narrow gap

let currentGap = HARD_GAP;
let currentMode = "HARD";

// ============ GAME STATE ============
let gameRunning = false;
let showMenu = true;
let score = 0;
let bestScoreEasy = 0;
let bestScoreHard = 0;

// Load best scores
try {
    let savedEasy = localStorage.getItem('flappyBestEasy');
    let savedHard = localStorage.getItem('flappyBestHard');
    if (savedEasy) bestScoreEasy = parseInt(savedEasy);
    if (savedHard) bestScoreHard = parseInt(savedHard);
} catch(e) {}

function updateBestUI() {
    let best = (currentMode === "EASY") ? bestScoreEasy : bestScoreHard;
    document.getElementById('bestScore').innerText = best;
}

function saveBestScore() {
    if (currentMode === "EASY") {
        if (score > bestScoreEasy) {
            bestScoreEasy = score;
            localStorage.setItem('flappyBestEasy', bestScoreEasy);
        }
    } else {
        if (score > bestScoreHard) {
            bestScoreHard = score;
            localStorage.setItem('flappyBestHard', bestScoreHard);
        }
    }
    updateBestUI();
}

// ============ BIRD ============
const BIRD_RADIUS = 14;
let bird = {
    x: 70,
    y: H/2,
    velocity: 0,
    gravity: 0.25,
    jumpPower: -5.2,
    rotation: 0
};

// ============ PIPES ============
const PIPE_WIDTH = 55;
const PIPE_SPACING = 210;
let pipes = [];
const SCROLL_SPEED = 2.5;

function randomPipeTop() {
    let minTop = 45;
    let maxTop = H - currentGap - 45;
    return Math.floor(Math.random() * (maxTop - minTop + 1) + minTop);
}

function resetPipes() {
    pipes = [];
    for (let i = 0; i < 3; i++) {
        pipes.push({
            x: W + 50 + (i * PIPE_SPACING),
            topHeight: randomPipeTop(),
            gap: currentGap,
            counted: false
        });
    }
}

function updatePipes() {
    for (let i = 0; i < pipes.length; i++) {
        pipes[i].x -= SCROLL_SPEED;
    }
    pipes = pipes.filter(p => p.x + PIPE_WIDTH > 0);
    
    if (pipes.length === 0 || pipes[pipes.length-1].x <= W - PIPE_SPACING + 30) {
        pipes.push({
            x: W,
            topHeight: randomPipeTop(),
            gap: currentGap,
            counted: false
        });
    }
    
    if (gameRunning) {
        for (let pipe of pipes) {
            // Collision detection
            let birdLeft = bird.x - BIRD_RADIUS;
            let birdRight = bird.x + BIRD_RADIUS;
            let birdTop = bird.y - BIRD_RADIUS;
            let birdBottom = bird.y + BIRD_RADIUS;
            
            // Top pipe collision
            if (birdRight > pipe.x && birdLeft < pipe.x + PIPE_WIDTH &&
                birdBottom > 0 && birdTop < pipe.topHeight) {
                gameRunning = false;
            }
            
            // Bottom pipe collision
            let bottomY = pipe.topHeight + pipe.gap;
            if (birdRight > pipe.x && birdLeft < pipe.x + PIPE_WIDTH &&
                birdBottom > bottomY && birdTop < H) {
                gameRunning = false;
            }
            
            // Scoring
            if (!pipe.counted && pipe.x + PIPE_WIDTH < bird.x) {
                pipe.counted = true;
                score++;
                document.getElementById('currentScore').innerText = score;
                saveBestScore();
            }
        }
    }
}

// ============ BIRD PHYSICS ============
function handleBirdPhysics() {
    if (!gameRunning) return;
    
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    bird.rotation = Math.min(Math.max(bird.velocity * 0.12, -0.8), 0.9);
    
    // Ceiling and ground collision
    if (bird.y - BIRD_RADIUS <= 0) {
        bird.y = BIRD_RADIUS;
        gameRunning = false;
    }
    if (bird.y + BIRD_RADIUS >= H) {
        bird.y = H - BIRD_RADIUS;
        gameRunning = false;
    }
}

function flap() {
    if (!gameRunning) return;
    bird.velocity = bird.jumpPower;
    bird.rotation = -0.45;
}

// ============ START GAME ============
function startGame(mode) {
    currentMode = mode;
    currentGap = (mode === "EASY") ? EASY_GAP : HARD_GAP;
    document.getElementById('modeDisplay').innerText = mode;
    updateBestUI();
    
    gameRunning = true;
    showMenu = false;
    score = 0;
    document.getElementById('currentScore').innerText = score;
    
    bird.y = H/2;
    bird.velocity = 0;
    bird.rotation = 0;
    
    resetPipes();
}

function showMenuScreen() {
    gameRunning = false;
    showMenu = true;
}

function logout() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}

// ============ DRAWING ============
function drawBackground() {
    let grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#1e3a4d');
    grad.addColorStop(1, '#14532d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    
    // Clouds
    ctx.fillStyle = "#ffffffaa";
    ctx.beginPath();
    ctx.ellipse(70, 80, 40, 30, 0, 0, Math.PI*2);
    ctx.ellipse(110, 70, 35, 28, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(300, 150, 45, 32, 0, 0, Math.PI*2);
    ctx.ellipse(340, 140, 38, 28, 0, 0, Math.PI*2);
    ctx.fill();
    
    // Ground
    ctx.fillStyle = '#4a6b2f';
    ctx.fillRect(0, H-35, W, 35);
    ctx.fillStyle = '#6b4c2b';
    ctx.fillRect(0, H-33, W, 8);
}

function drawPipes() {
    for (let pipe of pipes) {
        // Top pipe
        ctx.fillStyle = '#2d6a4f';
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        ctx.fillStyle = '#1f543b';
        ctx.fillRect(pipe.x-6, pipe.topHeight-40, PIPE_WIDTH+12, 40);
        ctx.fillStyle = '#d4a373';
        ctx.fillRect(pipe.x-2, pipe.topHeight-10, PIPE_WIDTH+4, 12);
        
        // Bottom pipe
        let bottomY = pipe.topHeight + pipe.gap;
        ctx.fillStyle = '#2d6a4f';
        ctx.fillRect(pipe.x, bottomY, PIPE_WIDTH, H - bottomY);
        ctx.fillStyle = '#1f543b';
        ctx.fillRect(pipe.x-6, bottomY, PIPE_WIDTH+12, 40);
        ctx.fillStyle = '#d4a373';
        ctx.fillRect(pipe.x-2, bottomY-2, PIPE_WIDTH+4, 12);
    }
}

function drawBird() {
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.rotation);
    ctx.beginPath();
    ctx.ellipse(0, 0, BIRD_RADIUS, BIRD_RADIUS*0.9, 0, 0, Math.PI*2);
    ctx.fillStyle = '#facc15';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(4, -3, 4, 5, 0, 0, Math.PI*2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(6, -4, 1.5, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(10, -2);
    ctx.lineTo(16, -1);
    ctx.lineTo(10, 2);
    ctx.fillStyle = '#f97316';
    ctx.fill();
    ctx.restore();
}

function drawMenu() {
    if (!showMenu) return;
    
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#facc15";
    ctx.font = "bold 32px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillText("FLAPPY FLIGHT", W/2, 100);
    
    ctx.font = "bold 20px monospace";
    ctx.fillStyle = "#e2e8f0";
    ctx.fillText("SELECT MODE", W/2, 180);
    
    // Easy button
    ctx.fillStyle = "#2dd4bf";
    ctx.fillRect(W/2 - 110, 220, 100, 50);
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 22px monospace";
    ctx.fillText("EASY", W/2 - 65, 255);
    
    // Hard button
    ctx.fillStyle = "#f97316";
    ctx.fillRect(W/2 + 10, 220, 100, 50);
    ctx.fillStyle = "#0f172a";
    ctx.fillText("HARD", W/2 + 55, 255);
    
    ctx.font = "14px monospace";
    ctx.fillStyle = "#cbd5e6";
    ctx.fillText("Easy: wider gap", W/2, 310);
    ctx.fillText("Hard: narrow gap", W/2, 340);
    ctx.font = "12px monospace";
    ctx.fillStyle = "#facc15";
    ctx.fillText("CLICK ON BUTTON", W/2, 400);
    
    ctx.font = "bold 11px monospace";
    ctx.fillStyle = "#a5f3fc";
    ctx.fillText(`🏆 BEST EASY: ${bestScoreEasy}    BEST HARD: ${bestScoreHard}`, W/2, 470);
    
    ctx.textAlign = "left";
}

function drawGameOver() {
    if (!gameRunning && !showMenu) {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, W, H);
        ctx.font = "bold 26px 'Courier New'";
        ctx.fillStyle = "#facc15";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", W/2, H/2 - 40);
        ctx.font = "bold 14px monospace";
        ctx.fillStyle = "#cbd5e1";
        ctx.fillText("Click MENU to play again", W/2, H/2 + 30);
        ctx.font = "bold 18px monospace";
        ctx.fillText("SCORE: " + score, W/2, H/2 + 80);
        ctx.textAlign = "left";
    }
}

function drawScore() {
    if (gameRunning) {
        ctx.font = "bold 32px 'Courier New'";
        ctx.fillStyle = "#fff7ed";
        ctx.shadowBlur = 3;
        ctx.fillText("" + score, W-45, 55);
        ctx.shadowBlur = 0;
    }
}

// ============ ANIMATION LOOP ============
function gameLoop() {
    if (gameRunning) {
        handleBirdPhysics();
        updatePipes();
    }
    
    drawBackground();
    drawPipes();
    drawBird();
    drawScore();
    drawGameOver();
    drawMenu();
    
    requestAnimationFrame(gameLoop);
}

// ============ EVENT HANDLERS ============
function handleCanvasClick(e) {
    if (showMenu) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        let mouseX, mouseY;
        
        if (e.touches) {
            mouseX = (e.touches[0].clientX - rect.left) * scaleX;
            mouseY = (e.touches[0].clientY - rect.top) * scaleY;
        } else {
            mouseX = (e.clientX - rect.left) * scaleX;
            mouseY = (e.clientY - rect.top) * scaleY;
        }
        
        if (mouseY >= 220 && mouseY <= 270) {
            if (mouseX >= W/2 - 110 && mouseX <= W/2 - 10) {
                startGame("EASY");
            } else if (mouseX >= W/2 + 10 && mouseX <= W/2 + 110) {
                startGame("HARD");
            }
        }
    } else if (gameRunning) {
        flap();
    }
}

canvas.addEventListener('click', handleCanvasClick);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleCanvasClick(e);
});

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (!showMenu && gameRunning) flap();
    }
});

document.getElementById('menuButton').addEventListener('click', () => {
    showMenuScreen();
});

document.getElementById('logoutButton').addEventListener('click', () => {
    logout();
});

// ============ START GAME LOOP ============
gameLoop();