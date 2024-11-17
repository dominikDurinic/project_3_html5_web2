var canvas = document.getElementById("gameCanvas");
var canvCtx = canvas.getContext("2d");

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
const yOffset = 150;

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

canvCtx.border = "1px solid black";

let newCoordinateX = 0;
let newCoordinateY = 0;

function randomColor() {
  let index = Math.floor(Math.random() * brickColors.length);
  return brickColors[index];
}

//naslov igre
canvCtx.fillStyle = "black";
canvCtx.font = "bold 40px Verdana";
canvCtx.fillText("BRICK DOWN", (canvasWidth - 300) / 2, 60);
canvCtx.font = "bold 20px Verdana";
canvCtx.fillText("online arcade game", (canvasWidth - 210) / 2, 85);

canvCtx.shadowBlur = 20;
canvCtx.shadowColor = "gray";

//po redovima i stupcima iscrtava pravokutnike različitih boja
for (let j = 0; j < 5; j++) {
  newCoordinateY = j * brickH + yOffset;

  for (let i = 0; i < 10; i++) {
    canvCtx.fillStyle = randomColor();
    newCoordinateX = i * brickW;
    canvCtx.fillRect(newCoordinateX, newCoordinateY, brickW, brickH);
  }
}

function drawStick(x) {
  //funkcija za iscrtavanje palice s obzirom na pomak
  canvCtx.shadowBlur = 0;
  canvCtx.shadowColor = "rgba(0, 0, 0, 0)";
  canvCtx.clearRect(stickX, stickY, stickWidth + 5, stickHeight); //brisanje stare palice

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
  canvCtx.shadowBlur = 0;
  canvCtx.shadowColor = "rgba(0, 0, 0, 0)";
  canvCtx.clearRect(
    prevBallX - radius - 1,
    prevBallY - radius - 1,
    2 * radius + 2,
    2 * radius + 2
  );
  canvCtx.beginPath();
  canvCtx.arc(ballX, ballY, radius, 0, 2 * Math.PI, false);
  canvCtx.fillStyle = "black";
  canvCtx.shadowBlur = 10;
  canvCtx.fillStyle = "red";
  canvCtx.fill();
  canvCtx.closePath();
  prevBallX = ballX;
  prevBallY = ballY;
}

function updatePosition() {
  ballX += move_x; //promjena x koordinate loptice na novu za pomak
  ballY += move_y; //promjena y koordinate loptice na novu za pomak

  //provjera sudara loptice i ruba canvasa
  if (ballX + radius > canvas.width || ballX - radius < 0) {
    move_x = -move_x;
  }
  if (ballY + radius > canvas.height || ballY - radius < 0) {
    move_y = -move_y;
  }
  //provjera sudara loptice i palice
  if (
    ballX + radius + 1 >= stickX &&
    ballX - radius <= stickX + stickWidth &&
    ballY + radius + 1 >= stickY &&
    ballY - radius <= stickY + stickHeight
  ) {
    if (ballX > stickX && ballX < stickX + stickWidth) {
      move_y = -move_y; // promjena smjera loptice pri sudaru s palicom
    }
  }
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
