let canvas = document.getElementById("gameCanvas");
let canvCtx = canvas.getContext("2d");

//postavljamo dimenzije canvasa na dimenzije css
//kako bi odgovarale veličine prikaza objekata u canvasu
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

//osnovni podaci
const brickColors = [
  "#52BDF6",
  "#F74646",
  "#F8F83D",
  "#5CF54B",
  "#FDA706",
  "#9832F8",
];

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

//cigla
const brickW = canvasWidth / 10;
const brickH = 50;
const yOffset = 130;
let bricks = [];

//palica
const stickWidth = 300;
const stickHeight = 40;
let stickX = (canvasWidth - stickWidth) / 2; //inicijalna x koordinata palice
let stickY = canvasHeight - stickHeight - 20; //inicijalna y koordinata palice
let moveValue = 50; //pomak palice na pritisak strelice

//loptica
let ballX = canvasWidth / 2; //inicijalna x koordinata loptice
let ballY = canvasHeight - 100; //inicijalna y koordinata loptice
let prevBallX = ballX;
let prevBallY = ballY;

let newCoordinateX = 0;
let newCoordinateY = 0;

function randomColor() {
  //slucajni odabir boje cigle
  let index = Math.floor(Math.random() * brickColors.length);
  return index;
}

//naslov igre
function drawText() {
  //iscrtavanje teksta naslov i bodovi
  canvCtx.fillStyle = "black";
  canvCtx.font = "bold 40px Verdana";
  canvCtx.fillText("BRICK DOWN", (canvasWidth - 300) / 2, 60);
  canvCtx.font = "bold 20px Verdana";
  canvCtx.fillText("online arcade game", (canvasWidth - 210) / 2, 85);
  canvCtx.fillStyle = "black";
  canvCtx.font = "bold 20px Verdana";
  canvCtx.fillText("Score: ", canvasWidth - 200, 60);
  canvCtx.font = "bold 20px Verdana";
  canvCtx.fillText("Best Score: ", canvasWidth - 256, 85);
}

//po redovima i stupcima iscrtava pravokutnike različitih boja
for (let j = 0; j < 5; j++) {
  newCoordinateY = j * brickH + yOffset;

  for (let i = 0; i < 10; i++) {
    let ind = randomColor();
    canvCtx.fillStyle = brickColors[ind];
    newCoordinateX = i * brickW;
    canvCtx.shadowBlur = 20;
    canvCtx.shadowColor = "gray";
    canvCtx.fillRect(newCoordinateX, newCoordinateY, brickW, brickH);
    bricks.push({ xPos: newCoordinateX, yPos: newCoordinateY, color_ind: ind }); //spremamo cigle zbog detekcije sudara loptice i pojedine cigle
  }
}

function drawStick(x) {
  //funkcija za iscrtavanje palice s obzirom na pomak
  clearCanvas();
  //provjera je li palica na krajevima canvasa
  if (x < 0) {
    stickX = 0;
  } else if (x > canvasWidth - stickWidth) {
    stickX = canvasWidth - stickWidth;
  } else {
    stickX = x;
  }

  //pravokutna palica
  canvCtx.fillStyle = "black";
  canvCtx.shadowBlur = 10;
  canvCtx.shadowColor = "gray";
  canvCtx.fillRect(stickX, stickY, stickWidth, stickHeight); //crtanjenove palice
}

window.addEventListener("keydown", function (e) {
  //pratimo pritisak strelica na tipkovnici te mijenjamo poziciju palice
  let x = 0;
  if (e.key == "ArrowLeft") {
    x = stickX - moveValue;
    drawStick(x);
  } else if (e.key == "ArrowRight") {
    x = stickX + moveValue;
    drawStick(x);
  }
});

//loptica

let move_x = 3;
let move_y = 3;
let radius = 15;

function drawBall() {
  //funkcija za iscrtavanje loptice na određenoj poziciji
  clearCanvas();
  drawStick(stickX);
  canvCtx.beginPath();
  canvCtx.arc(ballX, ballY, radius, 0, 2 * Math.PI, false);
  canvCtx.shadowBlur = 10;
  canvCtx.shadowColor = "gray";
  canvCtx.fillStyle = "red";
  canvCtx.fill();
  canvCtx.closePath();
  prevBallX = ballX;
  prevBallY = ballY;
}

function drawBricks() {
  bricks.forEach((brick) => {
    canvCtx.fillStyle = brickColors[brick.color_ind];
    canvCtx.shadowBlur = 10;
    canvCtx.shadowColor = "gray";
    canvCtx.fillRect(brick.xPos, brick.yPos, brickW, brickH); //crtanje cigli
  });
}

function clearCanvas() {
  canvCtx.clearRect(0, 0, canvasWidth, canvasHeight);
  drawBricks();
  drawText();
}

function updatePosition() {
  ballX += move_x; //promjena x koordinate loptice na novu za pomak
  ballY += move_y; //promjena y koordinate loptice na novu za pomak

  //provjera sudara loptice i ruba canvasa
  if (ballX + radius > canvas.width || ballX - radius < 0) {
    move_x = -move_x;
  }
  if (ballY + radius > canvas.height || ballY - radius < yOffset) {
    move_y = -move_y;
  }
  //provjera sudara loptice i palice
  if (
    ballX + radius >= stickX &&
    ballX - radius <= stickX + stickWidth &&
    ballY + radius >= stickY &&
    ballY - radius <= stickY + stickHeight
  ) {
    if (ballX > stickX && ballX < stickX + stickWidth) {
      move_y = -move_y; // promjena smjera loptice pri sudaru s palicom
    } else {
      move_x = -move_x;
    }
  }

  //provjera sudara loptice i pojedine cigle
  bricks.forEach((brick, index) => {
    if (
      ballX + radius >= brick.xPos &&
      ballX - radius <= brick.xPos + brickW &&
      ballY + radius >= brick.yPos &&
      ballY - radius <= brick.yPos + brickH
    ) {
      if (ballX > brick.xPos && ballX < brick.xPos + brickW) {
        move_y = -move_y; //promjena smjera y pozicije loptice pri sudaru s ciglom, vraća se u suprotnom smjeru
      } else {
        move_x = -move_x; //promjena smjera x pozicije loptice pri sudaru s ciglom
      }
      bricks.splice(index, 1); //brisanje sudarene cigle iz niza
      clearCanvas();
      canvCtx.clearRect(brick.xPos, brick.yPos, brickW, brickH); //brisanje sudarene cigle
    }
  });
}

function animate() {
  drawBall();
  updatePosition();
  requestAnimationFrame(animate);
}

window.onload = () => {
  animate(); //inicijalno crtanje loptice na sredini palice i pokretanje animacije
  drawStick(stickX); //inicijalno crtanje palice na sredini
};
