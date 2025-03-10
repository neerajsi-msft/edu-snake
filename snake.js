

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;

const canvasCells = 25;
const canvasSize = gridSize * canvasCells;
canvas.width = canvasSize;
canvas.height = canvasSize;

const snakeStart = [{ x: 5, y: 5 }];
const directionStart = { x: 0, y: 0 };
const foodStart = { x: 10, y: 10 };

let snake = [...snakeStart];
let direction = {...directionStart};
let food = {...foodStart};
let score = 0;

document.addEventListener('keydown', changeDirection);

function changeDirection(event) {
    const keyPressed = event.keyCode;
    const LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;

    if (keyPressed === LEFT && direction.x === 0) {
        direction = { x: -1, y: 0 };
    } else if (keyPressed === UP && direction.y === 0) {
        direction = { x: 0, y: -1 };
    } else if (keyPressed === RIGHT && direction.x === 0) {
        direction = { x: 1, y: 0 };
    } else if (keyPressed === DOWN && direction.y === 0) {
        direction = { x: 0, y: 1 };
    }
}

function update() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    if (head.x === food.x && head.y === food.y) {
        score++;
        food = {
            x: Math.floor(Math.random() * canvasCells),
            y: Math.floor(Math.random() * canvasCells)
        };
    } else {
        snake.pop();
    }

    snake.unshift(head);

    if (collision(head)) {
        resetGame();
    }
}

function collision(head) {
    if (head.x < 0 || head.x >= canvasCells || head.y < 0 || head.y >= canvasCells) {
        return true;
    }

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

function resetGame() {
    snake = [...snakeStart];
    direction = {...directionStart};
    score = 0;
}

function drawScore() {
    document.querySelector('.score').innerHTML = score;
}

function drawUnitCircle(ctx, x, y)
{
    ctx.fillStyle = 'red';
    ctx.beginPath()
    ctx.arc(x + .5, y + .5, .5, 0, 2 * Math.PI);
    ctx.fill()
}

function draw() {
    drawScore();

    ctx.save();
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    
    ctx.scale(gridSize, gridSize);
    ctx.fillStyle = 'lime';
    for (const segment of snake) {
        ctx.fillRect(segment.x + .1, segment.y + .1, .8, .8);
    }

    drawUnitCircle(ctx, food.x, food.y);

    ctx.restore();
}


function gameLoop() {
    update();
    draw();
    setTimeout(gameLoop, 500);
}

gameLoop();

