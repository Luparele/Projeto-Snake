// Descrição: Jogo da cobrinha em JavaScript com placar e armazenamento local
// Autor: Eduardo Luparele
// Data: 15/04/2025


// Constantes
const canvas = document.getElementById('snake-canvas'); // Canvas do jogo
const ctx = canvas.getContext('2d'); // Contexto do canvas
const scoreDisplay = document.getElementById('score'); // Elemento de exibição do placar
const playerNameInput = document.getElementById('playerName'); // Input do nome do jogador
const highScoresList = document.getElementById('highScoresList'); // Lista de pontuações
const startGameBtn = document.getElementById('startGameBtn'); // Botão de iniciar jogo
const gridSize = 20; // Tamanho da grade do jogo
let tileCount = canvas.width / gridSize; // Número de tiles na grade
let snake = [{ x: 10, y: 10 }]; // Array que armazena o corpo da serpente
let velocityX = 0; // Velocidade horizontal da serpente
let velocityY = 0; // Velocidade vertical da serpente
let food = { x: 5, y: 5 }; // Coordenadas da comida
let score = 0; // Pontuação do jogador
let gameInterval; // Intervalo do loop do jogo
const gameSpeed = 150; // Velocidade do loop do jogo
let playerName = ''; // Nome do jogador
const highScoresKey = 'snakeHighScores'; // Chave do localStorage para pontuações
let gameStarted = false; // Flag para controlar se o jogo começou

// Funções
function drawGrid() { // Função que desenha a grade do jogo
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

function drawSnake() { // Função que desenha a serpente
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

function drawFood() { // Função que desenha a comida
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
    ctx.strokeStyle = 'darkred';
    ctx.strokeRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

function moveSnake() { // Função que move a serpente
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

function checkCollision() { // Função que verifica se houve colisão
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

function placeFood() { // Função que coloca a comida em um local aleatório
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    snake.forEach(segment => {
        if (segment.x === food.x && segment.y === food.y) {
            placeFood();
        }
    });
}

function changeDirection(event) { // Função que muda a direção da serpente
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

function gameLoop() { // Função que executa o loop do jogo
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

function gameOver() { // Função que executa quando o jogo termina
    clearInterval(gameInterval);
    gameStarted = false; // Reset flag
    playerName = playerNameInput.value.trim() || 'Jogador Anônimo';
    saveScore(playerName, score);
    displayHighScores();
    alert(`Fim de Jogo, ${playerName}! Sua pontuação foi: ${score}`);
    resetGame();
}

function resetGame() { // Função que reseta o jogo
    snake = [{ x: 10, y: 10 }];
    velocityX = 0;
    velocityY = 0;
    score = 0;
    scoreDisplay.textContent = score;
    placeFood();
    gameStarted = false; // Ensure gameStarted is false after reset
}

function getHighScores() { // Função que obtém as pontuações do localStorage
    const scoresString = localStorage.getItem(highScoresKey);
    return scoresString ? JSON.parse(scoresString) : [];
}

function saveScore(name, finalScore) { // Função que salva a pontuação do jogador
    const highScores = getHighScores();
    highScores.push({ name, score: finalScore });
    highScores.sort((a, b) => b.score - a.score);
    localStorage.setItem(highScoresKey, JSON.stringify(highScores.slice(0, 5)));
}

function displayHighScores() { // Função que exibe as pontuações
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

function startGame() { // Função que inicia o jogo
    if (!gameStarted) {
        resetGame(); // Reset para garantir estado inicial
        gameStarted = true;
        gameLoop();
    }
}

// Inicialização
displayHighScores();
startGameBtn.addEventListener('click', startGame);
document.addEventListener('keydown', changeDirection);