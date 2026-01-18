// Canvas 設定
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 遊戲常數
const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 600;
const PLAYER_SPEED = 8;
const COIN_SPEED = 5;
const FPS = 60;

// 顏色定義
const BLACK = '#000000';
const WHITE = '#FFFFFF';
const GOLD = '#FFD700';

// 遊戲狀態
let gameState = 'start'; // 'start', 'playing', 'paused'
let score = 0;
let animationId = null;

// 圖片資源
const images = {
    player: new Image(),
    basketball: new Image()
};

let imagesLoaded = {
    player: false,
    basketball: false
};

// 載入圖片
images.player.src = 'stephen_curry.png';
images.basketball.src = 'basketball.png';

images.player.onload = () => {
    imagesLoaded.player = true;
    console.log('Player image loaded');
};

images.player.onerror = () => {
    console.warn('Player image failed to load, using fallback');
    imagesLoaded.player = false;
};

images.basketball.onload = () => {
    imagesLoaded.basketball = true;
    console.log('Basketball image loaded');
};

images.basketball.onerror = () => {
    console.warn('Basketball image failed to load, using fallback');
    imagesLoaded.basketball = false;
};

// 玩家類別
class Player {
    constructor() {
        this.width = 90;
        this.height = 90;
        this.x = SCREEN_WIDTH / 2 - this.width / 2;
        this.y = SCREEN_HEIGHT - this.height - 10;
        this.speed = PLAYER_SPEED;
    }

    update(keys) {
        if (keys['ArrowLeft'] && this.x > 0) {
            this.x -= this.speed;
        }
        if (keys['ArrowRight'] && this.x + this.width < SCREEN_WIDTH) {
            this.x += this.speed;
        }
    }

    draw() {
        if (imagesLoaded.player) {
            ctx.drawImage(images.player, this.x, this.y, this.width, this.height);
        } else {
            // 備用：白色方塊
            ctx.fillStyle = WHITE;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    getRect() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// 籃球類別
class Basketball {
    constructor() {
        this.width = 50;
        this.height = 50;
        this.radius = 15;
        this.speed = COIN_SPEED;
        this.spawn();
    }

    spawn() {
        this.x = Math.random() * (SCREEN_WIDTH - this.width);
        this.y = -this.height;
    }

    update() {
        this.y += this.speed;

        // 檢查是否掉出螢幕
        if (this.y > SCREEN_HEIGHT) {
            score -= 5;
            updateScoreDisplay();
            this.spawn();
        }
    }

    draw() {
        if (imagesLoaded.basketball) {
            ctx.drawImage(images.basketball, this.x, this.y, this.width, this.height);
        } else {
            // 備用：金色圓形
            ctx.fillStyle = GOLD;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    getRect() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// 碰撞檢測
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y;
}

// 遊戲物件
let player;
let basketballs = [];
let keys = {};

// 初始化遊戲
function initGame() {
    score = 0;
    updateScoreDisplay();

    player = new Player();
    basketballs = [];

    // 創建一個籃球
    basketballs.push(new Basketball());

    keys = {};
}

// 更新分數顯示
function updateScoreDisplay() {
    document.getElementById('score').textContent = score;
}

// 遊戲主循環
function gameLoop() {
    if (gameState !== 'playing') return;

    // 清空畫布
    ctx.fillStyle = BLACK;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // 更新
    player.update(keys);
    basketballs.forEach(ball => ball.update());

    // 碰撞檢測
    const playerRect = player.getRect();
    basketballs.forEach(ball => {
        const ballRect = ball.getRect();
        if (checkCollision(playerRect, ballRect)) {
            score += 10;
            updateScoreDisplay();
            ball.spawn();
        }
    });

    // 繪製
    basketballs.forEach(ball => ball.draw());
    player.draw();

    // 繪製遊戲內分數 (可選)
    ctx.fillStyle = WHITE;
    ctx.font = '36px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 10, 40);

    // 繼續循環
    animationId = requestAnimationFrame(gameLoop);
}

// 開始遊戲
function startGame() {
    initGame();
    gameState = 'playing';
    document.getElementById('startScreen').classList.add('hidden');
    gameLoop();
}

// 暫停遊戲
function pauseGame() {
    if (gameState === 'playing') {
        gameState = 'paused';
        document.getElementById('pauseScreen').classList.remove('hidden');
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    }
}

// 繼續遊戲
function resumeGame() {
    if (gameState === 'paused') {
        gameState = 'playing';
        document.getElementById('pauseScreen').classList.add('hidden');
        gameLoop();
    }
}

// 重新開始遊戲
function restartGame() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    gameState = 'start';
    document.getElementById('pauseScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
}

// 鍵盤事件處理
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    // 空白鍵暫停/繼續
    if (e.key === ' ') {
        e.preventDefault();
        if (gameState === 'playing') {
            pauseGame();
        } else if (gameState === 'paused') {
            resumeGame();
        }
    }

    // R 鍵重新開始
    if (e.key === 'r' || e.key === 'R') {
        restartGame();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// 按鈕事件
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('resumeBtn').addEventListener('click', resumeGame);
document.getElementById('restartBtn').addEventListener('click', restartGame);

// 初始化
initGame();
