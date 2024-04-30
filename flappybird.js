//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// Background variables
let backgroundImage;
let backgroundImageX1 = 0;
let backgroundImageX2 = boardWidth;

let moonImage;
let moonImageWidth = 100; // Adjusted width of the moon image
let moonImageHeight = 100; // Adjusted height of the moon image
let moonImageX1 = boardWidth / 2; // Initial position of the first moon image
//let moonImageX2 = boardWidth * 1.5; // Initial position of the second moon image

//bird
let birdWidth = 34; //width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;
let birdAngle = 0; // Bird's tilt angle
let tiltFactor = 0.2; // Increased tilt factor to make the tilt more pronounced
let tiltSmoothingFactor = 0.1; // Smoothing factor to control the rate of tilt change

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
};

//pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2; //pipes moving left speed
let velocityY = 0; //bird jump speed
let gravity = 0.1; // Reduced gravity

let gameOver = false;
let score = 0;
let highScore = 0; // Variable to store the high score
let gameStarted = false;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    // Load images
    birdImg = new Image();
    birdImg.src = "./flappybird.png";

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    backgroundImage = new Image();
    backgroundImage.src = "./flappybirdbg.png";

    moonImage = new Image();
    moonImage.src = "./moon.png";

    // Draw start screen with background image
    drawStartScreen();

    // Add event listener for click event on the canvas
    board.addEventListener("click", jumpBird);
};

function drawStartScreen() {
    // Draw background image
    context.drawImage(backgroundImage, backgroundImageX1, 0, boardWidth, boardHeight);
    context.drawImage(backgroundImage, backgroundImageX2, 0, boardWidth, boardHeight);

    // Draw moon image
    context.drawImage(moonImage, moonImageX1, 50, moonImageWidth, moonImageHeight);
    //context.drawImage(moonImage, moonImageX2, 50, moonImageWidth, moonImageHeight);

    // Draw other elements on top of the background image
    context.fillStyle = "white";
    context.font = "30px sans-serif";
    context.fillText("Flappy Wings", 100, 200);

    // Draw play button
    context.fillStyle = "green";
    context.fillRect(120, 250, 120, 50);
    context.fillStyle = "white";
    context.font = "20px sans-serif";
    context.fillText("Play", 160, 283);

    // Add event listener for play button click
    board.addEventListener("click", startGame);
}

function startGame() {
    gameStarted = true;
    // Remove event listener for play button click
    board.removeEventListener("click", startGame);
    requestAnimationFrame(update);
    setInterval(placePipes, 1500); //every 1.5 seconds
    document.addEventListener("keydown", moveBird);
}

function update() {
    requestAnimationFrame(update);
    if (!gameStarted || gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    // Move background images
    backgroundImageX1 += velocityX;
    backgroundImageX2 += velocityX;
    moonImageX1 += velocityX * 0.05; // Adjusted parallax speed for the moon
    //moonImageX2 += velocityX * 0.05;

    if (backgroundImageX1 <= -boardWidth) {
        backgroundImageX1 = boardWidth;
    }
    if (backgroundImageX2 <= -boardWidth) {
        backgroundImageX2 = boardWidth;
    }

    // Reset moon position if it goes offscreen
    if (moonImageX1 <= -moonImageWidth) {
        moonImageX1 = boardWidth * 2; // Change the initial position to prevent looping
    }
    //if (moonImageX2 <= -moonImageWidth) {
    //    moonImageX2 = boardWidth * 2.5; // Change the initial position to prevent looping
    //}

    // Draw background image
    context.drawImage(backgroundImage, backgroundImageX1, 0, boardWidth, boardHeight);
    context.drawImage(backgroundImage, backgroundImageX2, 0, boardWidth, boardHeight);

    // Draw moon image
    context.drawImage(moonImage, moonImageX1, 50, moonImageWidth, moonImageHeight);
    //context.drawImage(moonImage, moonImageX2, 50, moonImageWidth, moonImageHeight);

    // bird
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit the bird.y to top of the canvas

    // Update bird angle based on velocity
    let targetAngle = velocityY * tiltFactor; // Calculate target angle based on velocity
    birdAngle += (targetAngle - birdAngle) * tiltSmoothingFactor; // Gradually adjust bird angle towards target angle

    // Draw rotated bird image
    context.save();
    context.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    context.rotate(birdAngle);
    context.drawImage(birdImg, -bird.width / 2, -bird.height / 2, bird.width, bird.height);
    context.restore();

    if (bird.y > board.height) {
        gameOver = true;
        if (score > highScore) {
            highScore = score; // Update the high score if current score is higher
        }
        // Reset moon position
        moonImageX1 = boardWidth / 2;
        //moonImageX2 = boardWidth * 1.5;
    }

    // pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
            if (score > highScore) {
                highScore = score; // Update the high score if current score is higher
            }
        }
    }

    // clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

    // score
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText("Score: " + score, 5, 45);

    if (gameOver) {
        context.fillStyle = "rgba(0, 0, 0, 0.5)"; // Semi-transparent black color
        context.fillRect(0, 0, board.width, board.height); // Draw overlay
        context.fillStyle = "white";
        context.font = "35px sans-serif";
        context.fillText("GAME OVER", 60, 250);
        context.fillText("High Score: " + highScore, 60, 300);
        context.font = "20px sans-serif";
        context.fillText("Space to Restart", 100, 350);
    }
}

function placePipes() {
    if (!gameStarted || gameOver) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        velocityY = -4.5;
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

function jumpBird() {
    if (!gameStarted || gameOver) return;
    velocityY = -4.5; // Set jump velocity
    birdAngle = Math.PI / 4; // Tilt bird upward when jumping
}
