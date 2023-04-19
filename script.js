
// Brettet
let board;
let boardWidth;
if(window.innerWidth < 540){
    boardWidth = 360;
}else {
    boardWidth = 420;
}

let boardHeight = 580;
let context;

// Selve fuglen

let birdHeight
let birdWidth //width/height ratio = 408/228 = 17/12
if(window.innerWidth < 540){
    birdHeight = 30;
    birdWidth = 35.5;
}else {
    birdHeight = 33;
    birdWidth = 39;
}

let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdImg;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight,
}

// Rør
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// Spillfysikken
let velocityX = -2.5; //pipes moving left speed
let velocityY = 0; //bird jump speed
let gravity = 0.35;

// Spillets startmodus ikke i gameOver
let gameOver = false;


// Scoringsystemet
let score = 0;
if(!localStorage.highscore){
    localStorage.highscore = 0
}



window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); // Lager en CanvasRenderingContext2D, et objekt som representerer en todimensjonnell rendering. Brukt for å tegne på brettet


    // Lager bildene, definerer de her i stedet for å hente med ID fra DOM
    birdImg = new Image();
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "./bilder/toppror.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bilder/bunnror.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 2000); // Plasserer rør hvert 2 sekund
    document.addEventListener("keydown", moveBird);

}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    // Fuglens fysikk
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0); // Legg til tyngdekraft til nåværende bird.y (fuglens y-verdi på canvasen, begrens bird.y til toppen av canvasen)
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    
    // Måte nummer 1 at spillet avsluttes på; fuglen av brettet
    if (bird.y > board.height) {
        gameOver = true;
        if(localStorage.highscore<score){
            localStorage.highscore = score
        }
    }

    // Rør
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; // 0.5 fordi det er 2 rør, så 0.5*2=1 som gir 1 for hver set med rør passert

            pipe.passed = true;
            velocityX += -0.05;


        }

        
        // Måte nummer 2 å tape spillet på
        if (detectCollision(bird, pipe)) {
            gameOver = true;
            if(localStorage.highscore<score){
                localStorage.highscore = score
            }
            
            /*if(localStorage.highscore<score){
                localStorage.highscore = score
            }
            if(localStorage.highscore<=3) {
                birdImg.src = "./bilder/flappybird.png";
            }
            if(localStorage.highscore>=4) {
                birdImg.src = "./bilder/flappybird_rod.png";
            }
            if(localStorage.highscore>=7) {
                birdImg.src = "./bilder/flappybird_gronn.png";
            }
            if(localStorage.highscore>=10) {
                birdImg.src = "./bilder/flappybird_blaa.png";
            }*/

        }
    }

    // Fjerner rørene
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //Fjerner første element fra arrayet
    }

    // Score
    context.fillStyle = "lightyellow";
    context.font="50px sans-serif";
    context.fillText(score, 3, 45);

    if (gameOver) {
        context.font="40px sans-serif";
        context.fillStyle = "black";
        context.fillText("GAME OVER", 85, 280);
        context.fillStyle = "black";
        context.fillText(`HIGHSCORE: ${localStorage.highscore}`, 55, 320);
    }
    if(score<=10) {
        birdImg.src = "./bilder/flappybird.png";
    }
    if(score>=11) {
        birdImg.src = "./bilder/flappybird_rod.png";
    }
    if(score>=20) {
        birdImg.src = "./bilder/flappybird_gronn.png";
    }
    if(score>=30) {
        birdImg.src = "./bilder/flappybird_blaa.png";
    }
    if(score>=40) {
        birdImg.src = "./bilder/flappybird_regnbue.png";
    }

    
}

function placePipes() {
    if (gameOver) {
        return;
    }

    //(0-1) * pipeHeight/2.
    // 0 -> -128 (pipeHeight/4)
    // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4;


    // Lager rørene i spillet og putter de inn i arrayet for rør
    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "Enter") {
        // Hopp
        velocityY = -6;

        // Reset spillet
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   // a's øverste venstre hjørne kommer ikke nær b's øverste høyre hjørne
           a.x + a.width > b.x &&   // a's øverste høyre hjørne kommer ikke nær b's øverste venstre hjørne
           a.y < b.y + b.height &&  // a's øverste venstre hjørne kommer ikke nær b's nederste venstre hjørne
           a.y + a.height > b.y;    // a's nederste venstre hjørne kommer ikke nær b's øverste venstre hjørne
}