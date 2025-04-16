// Descrição: Jogo da cobrinha em JavaScript com placar e armazenamento local
// Autor: Eduardo Luparele
// Data: 15/04/2025


const canvas = document.getElementById('snake-canvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const playerNameInput = document.getElementById('playerName');
const highScoresList = document.getElementById('highScoresList');
const startGameBtn = document.getElementById('startGameBtn');

const gridSize = 20;
let tileCount = canvas.width / gridSize;
let snake = [{ x: 10, y: 10 }];
let velocityX = 0;
let velocityY = 0;
let food = { x: 5, y: 5 };
let score = 0;
let gameInterval;
const gameSpeed = 150;
let playerName = '';
const highScoresKey = 'snakeHighScores';
let gameStarted = false; // Flag para controlar se o jogo começou

function drawGrid() {
    ctx.strokeStyle = '#444';
    for (let i = 0; i < tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
}

function drawSnake() {
    ctx.fillStyle = 'lime';
    ctx.fillRect(snake[0].x * gridSize, snake[0].y * gridSize, gridSize - 2, gridSize - 2);
    ctx.strokeStyle = 'darkgreen';
    ctx.strokeRect(snake[0].x * gridSize, snake[0].y * gridSize, gridSize - 2, gridSize - 2);
    for (let i = 1; i < snake.length; i++) {
        ctx.fillStyle = 'lightgreen';
        ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize - 2, gridSize - 2);
        ctx.strokeStyle = 'darkgreen';
        ctx.strokeRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize - 2, gridSize - 2);
    }
}

function drawFood() {
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
    ctx.strokeStyle = 'darkred';
    ctx.strokeRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

function moveSnake() {
    const head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreDisplay.textContent = score;
        placeFood();
    } else {
        snake.pop();
    }
}

function checkCollision() {
    const head = snake[0];

    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return true;
    }

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return true;
        }
    }
    return false;
}

function placeFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    snake.forEach(segment => {
        if (segment.x === food.x && segment.y === food.y) {
            placeFood();
        }
    });
}

function changeDirection(event) {
    if (!gameStarted) return; // Só permitir mudança de direção se o jogo começou
    if (event.key === 'ArrowUp' && velocityY !== 1) {
        velocityX = 0;
        velocityY = -1;
    } else if (event.key === 'ArrowDown' && velocityY !== -1) {
        velocityX = 0;
        velocityY = 1;
    } else if (event.key === 'ArrowLeft' && velocityX !== 1) {
        velocityX = -1;
        velocityY = 0;
    } else if (event.key === 'ArrowRight' && velocityX !== -1) {
        velocityX = 1;
        velocityY = 0;
    }
}

function gameLoop() {
    setTimeout(() => {
        if (gameStarted) {
            if (!checkCollision()) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawGrid();
                drawFood();
                drawSnake();
                moveSnake();
                gameLoop();
            }
        }
    }, gameSpeed);
}

function gameOver() {
    clearInterval(gameInterval);
    gameStarted = false; // Reset flag
    playerName = playerNameInput.value.trim() || 'Jogador Anônimo';
    saveScore(playerName, score);
    displayHighScores();
    alert(`Fim de Jogo, ${playerName}! Sua pontuação foi: ${score}`);
    resetGame();
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    velocityX = 0;
    velocityY = 0;
    score = 0;
    scoreDisplay.textContent = score;
    placeFood();
    gameStarted = false; // Ensure gameStarted is false after reset
}

function getHighScores() {
    const scoresString = localStorage.getItem(highScoresKey);
    return scoresString ? JSON.parse(scoresString) : [];
}

function saveScore(name, finalScore) {
    const highScores = getHighScores();
    highScores.push({ name, score: finalScore });
    highScores.sort((a, b) => b.score - a.score);
    localStorage.setItem(highScoresKey, JSON.stringify(highScores.slice(0, 5)));
}

function displayHighScores() {
    const highScores = getHighScores();
    const listItems = highScoresList.querySelectorAll('li');
    listItems.forEach((li, index) => {
        const nameSpan = li.querySelector('.name');
        const scoreSpan = li.querySelector('.final-score');
        const trophySpan = li.querySelector('.trophy');

        if (highScores[index]) {
            nameSpan.textContent = highScores[index].name;
            scoreSpan.textContent = highScores[index].score;
            trophySpan.className = 'trophy';

            if (index === 0) {
                trophySpan.classList.add('gold');
            } else if (index === 1) {
                trophySpan.classList.add('silver');
            } else if (index === 2) {
                trophySpan.classList.add('bronze');
            }
        } else {
            nameSpan.textContent = '';
            scoreSpan.textContent = '';
            trophySpan.className = 'trophy';
        }
    });
}

function startGame() {
    if (!gameStarted) {
        resetGame(); // Reset para garantir estado inicial
        gameStarted = true;
        gameLoop();
    }
}

// Inicialização: Exibir placar e adicionar listener ao botão de iniciar
displayHighScores();
startGameBtn.addEventListener('click', startGame);
document.addEventListener('keydown', changeDirection);