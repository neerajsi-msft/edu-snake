const canvas = document.getElementById('gameCanvas');
const pauseButton = document.getElementById('pause');

const ctx = canvas.getContext('2d');

// Each cell of the grid is 20 pixels.
const gridCellPixels = 40;

// The grid is 10x10 cells.
const gridCellCount = 10;

// Define the entire size of the drawing surface.
// Reserve one cell for the axis labels.
// Reserve 4 pixels for the border.
const canvasSize = gridCellPixels * (gridCellCount + 1) + 4;

// Make a square drawing surface (aka 'canvas')
canvas.width = canvasSize;
canvas.height = canvasSize;

// Define the possible directions.
const Directions = Object.freeze({
    UP: 'UP',
    DOWN: 'DOWN',
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    NONE: 'NONE'
});

// Define the opposite of each direction.
const OppositeDirections = Object.freeze({
    UP: Directions.DOWN,
    DOWN: Directions.UP,
    LEFT: Directions.RIGHT,
    RIGHT: Directions.LEFT,
});

// Define the "vector" for each direction, which is the change in x and y
// coordinates that the snake will move when it goes in that direction.
const DirectionVectors = Object.freeze({
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
    NONE: { x: 0, y: 0 }
});

// The snake starts at (5, 5)
const snakeStart = [{ x: 5, y: 5 }];

// At the beginning the snake is stopped
const directionStart = Directions.NONE;

const foodStart = { x: 8, y: 8 };


// Copy the snake start location.
let snake = [...snakeStart];

// Set the start direction.
let direction = directionStart;
let lastDirection = directionStart;

let food = {...foodStart};

let score = 0;
let paused = false;

document.addEventListener('keydown', changeDirection);

// This subroutine is called when a button is pressed.
// Its parameter is an 'event' that tells us which button is pressed.
function changeDirection(event) {

    // get the name of the keyboard button that was pressed
    const keyPressed = event.code;

    // Start by assuming the snake won't change directions.
    let newDirection = direction;

    // Translate from key press to new direcition or pause.
    switch (keyPressed) {
        case 'ArrowLeft': newDirection = Directions.LEFT; break;
        case 'ArrowRight': newDirection = Directions.RIGHT; break;
        case 'ArrowUp': newDirection = Directions.UP; break;
        case 'ArrowDown': newDirection = Directions.DOWN; break;
        case 'Space':
            pauseButton.checked = !pauseButton.checked;
            break;

        case 'KeyS':
            simulateSnake();
            break;
    }

    // Ignore any attempt to go backwards.
    if (newDirection !== OppositeDirections[lastDirection]) {
        direction = newDirection;
    }
}

// This subroutine computes the new location of the snake.
function simulateSnake() {

    // Translate from the direction name to the "vector",
    // which is the change in x and y coordinates that the snake
    // will move when it goes in that direction.
    const directionVector = DirectionVectors[direction];

    // Keep track of the previous movement direction to
    // prevent the snake from turning back on itself.
    lastDirection = direction;

    // Compute where the head will move after this step (which direction).
    const head = { x: snake[0].x + directionVector.x, y: snake[0].y + directionVector.y };

    // If the snake's head is on the food, eat it.
    if (head.x === food.x && head.y === food.y) {
        // The snake is growing, so leave the tail alone rather than
        // removing it.
        
        // Increase the score.
        score++;

        // Find a new random place place to put the food.
        // "Math.random()" returns a random number between 0 and 1.
        // 
        // "Math.floor()" takes a fractional number like 4.3 and returns
        // the whole part -- 4.
        food = {
            x: Math.floor(Math.random() * gridCellCount),
            y: Math.floor(Math.random() * gridCellCount)
        };

    } else {
        // If the snake is not growing, remove the tail piece of the snake.
        snake.pop();
    }

    // Put the new location of the head on the front of the snake.
    snake.unshift(head);

    // Check for the snake hitting itself or the wall.
    if (collision(head)) {
        resetGame();
    }
}

// This subroutine determines if the snake has collided.
function collision(head) {

    // If the snake is past the wall, it has collided.
    if (head.x < 0 || head.x >= gridCellCount || head.y < 0 || head.y >= gridCellCount) {
        return true;
    }

    // If the head of the snake overlaps any part of the body, it has collided
    // with itself.
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }

    // Otherwise the snake is free to roam.
    return false;
}

// Start the game at its initial conditions.
function resetGame() {
    snake = [...snakeStart];
    direction = directionStart;
    score = 0;
}

function draw() {
    drawScore();
    drawVariables();

    ctx.save();

    // Clear out the canvas.
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    
    ctx.scale(gridCellPixels, gridCellPixels);
    
    // Make space for the axis labels.
    ctx.translate(1, 1);

    // Draw the grid.
    drawGrid(ctx);

    // Draw the pieces of the snake.
    ctx.fillStyle = 'lime';
    for (const segment of snake) {

        // The .1 and .8 are to make sure the pieces of the snake have
        // a blank border around them.
        //
        //     .8
        // | ------ |
        //  ^      ^
        //  .1    .1
        //

        ctx.fillRect(segment.x + .1, segment.y + .1, .8, .8);
    }

    // Draw the letter 'H' on the head of the snake.
    {
        const head = snake[0];
        ctx.fillStyle = 'red';
        ctx.font = '.6px sans-serif';
        ctx.fillText('H', head.x + .3, head.y + .7);
    }

    // Draw the food
    drawUnitCircle(ctx, food.x, food.y);

    ctx.restore();
}

// This function draws the grid to the canvas.
function drawGrid(ctx) {
    ctx.fillStyle = 'gray';

    ctx.font = '.5px sans-serif';
    
    // Draw the horizontal lines of the grid.
    for (let i = 0; i <= gridCellCount; i++) {
        ctx.fillRect(i, 0, .05, gridCellCount);
        ctx.fillText(i, i + .4, -.2);
    }

    // Draw the vertical lines of the grid.
    for (let i = 0; i <= gridCellCount; i++) {
        ctx.fillRect(0, i, gridCellCount, .05);
        ctx.fillText(i, -.4, i + .7);
    }


}

// This function draws a circle to the canvas.
function drawUnitCircle(ctx, x, y)
{
    ctx.fillStyle = 'red';
    ctx.beginPath()
    
    // This "arc" call describes a part of a circular outline.

    ctx.arc(x + .5,  // The x coordinate of the center (+.5 for middle of the grid cell)
            y + .5,  // The y coordinate of the center
            .5,      // The radius of the circle
            0,       // The start point (on the right center of the circle)
            2 * Math.PI); // The end point (go all the way around the circle).

    // Fill in the circle outlined above.
    ctx.fill()
}

function drawScore() {
    document.querySelector('.score').innerHTML = score;
}

function drawVariables() {
    const head = snake[0];
    const directionVector = DirectionVectors[direction];

    // Update display of internal variables.
    document.querySelector('.variables').innerHTML = `
        <div>Head: [${head.x}, ${head.y}]</div>
        <div>Direction: ${direction} [${directionVector.x}, ${directionVector.y}]</div>
        <div>Food: [${food.x}, ${food.y}]</div>
        <div>Score: ${score}</div>
    `;
}

function gameLoop() {
    // If the game is paused, don't move the snake.
    if (!pauseButton.checked) {
        // Compute the next step the snake will take.
        simulateSnake();        
    }
    

    // Draw the snake and the grid
    draw();

    // Trigger the simulation to run again after 500 milliseconds (.5 seconds)
    setTimeout(gameLoop, 500);
}

onShowVariablesChange();
gameLoop();

function onShowVariablesChange() {
    let newState = 'hidden';
    if (document.getElementById('showVariables').checked === true) {
        newState = 'visible';
    }

    document.querySelector('.variables').style.visibility = newState;
}