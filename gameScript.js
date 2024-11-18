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
let gameAnimation;
let cancleAnim = false;

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

let newCoordinateX = 0;
let newCoordinateY = 0;

//bodovi
let totalScore = 0;
let bestScore =
  localStorage.getItem("bestScore") !== null
    ? localStorage.getItem("bestScore")
    : 0;

function randomColor() {
  //slucajni odabir boje cigle
  let index = Math.floor(Math.random() * brickColors.length);
  return index;
}

//NASLOV i UKUPNI BODOVI
function drawText() {
  //iscrtavanje teksta naslov i bodovi
  const img = document.getElementById("logoImg");
  canvCtx.drawImage(img, (canvasWidth - 500) / 2, 20);
  canvCtx.fillStyle = "black";
  canvCtx.font = "bold 40px Verdana";
  canvCtx.fillText("BRICK DOWN", (canvasWidth - 300) / 2, 60);
  canvCtx.font = "bold 20px Verdana";
  canvCtx.fillText("online arcade game", (canvasWidth - 210) / 2, 85);
  canvCtx.fillStyle = "black";

  //bodovi
  canvCtx.shadowBlur = 0;
  canvCtx.font = "bold 20px Verdana";
  canvCtx.fillStyle = "black";
  canvCtx.fillText(`Total Score: ${totalScore}`, canvasWidth - 263, 50);
  canvCtx.font = "bold 20px Verdana";
  canvCtx.fillStyle = "red";
  canvCtx.fillText(`Best Score: ${bestScore}`, canvasWidth - 256, 85);
}

//INICIJALIZACIJA CIGLI
//po redovima i stupcima iscrtava pravokutnike različitih boja
function initialDrawBricks() {
  for (let j = 0; j < 5; j++) {
    newCoordinateY = j * brickH + yOffset;

    for (let i = 0; i < 10; i++) {
      let ind = randomColor();
      canvCtx.fillStyle = brickColors[ind];
      newCoordinateX = i * brickW;
      canvCtx.shadowBlur = 20;
      canvCtx.shadowColor = "gray";
      canvCtx.fillRect(newCoordinateX, newCoordinateY, brickW, brickH);
      bricks.push({
        xPos: newCoordinateX,
        yPos: newCoordinateY,
        color_ind: ind,
      }); //spremamo cigle zbog detekcije sudara loptice i pojedine cigle
    }
  }
}

//PALICA
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

//LOPTICA

let move_x = 4; //brzina pomaka loptice u x smjeru
let move_y = 4; //brzina pomaka loptice u x smjeru
let radius = 15;

function drawBall() {
  //funkcija za iscrtavanje loptice na određenoj poziciji
  clearCanvas();
  drawStick(stickX);
  canvCtx.beginPath();
  canvCtx.arc(ballX, ballY, radius, 0, 2 * Math.PI, false); //crtanje kruga pocetni kut = 0 i krajnji kut = 2*PI
  canvCtx.shadowBlur = 10;
  canvCtx.shadowColor = "gray";
  canvCtx.fillStyle = "red";
  canvCtx.fill();
  canvCtx.closePath();
}

//CIGLE
function drawBricks() {
  //funkcija za iscrtavanje cigli iz bricks[] polja
  bricks.forEach((brick) => {
    canvCtx.fillStyle = brickColors[brick.color_ind];
    canvCtx.shadowBlur = 10;
    canvCtx.shadowColor = "gray";
    canvCtx.fillRect(brick.xPos, brick.yPos, brickW, brickH); //crtanje cigli
  });
}

//brisanje canvasa, prikaz najnovijeg stanja
function clearCanvas() {
  canvCtx.clearRect(0, 0, canvasWidth, canvasHeight);
  drawBricks();
  drawText();
}

/**DETEKCIJA SUDARA loptice s drugim objektima te promjena pozicije loptice**/
function detectCollision() {
  ballX += move_x; //promjena x koordinate loptice na novu za pomak
  ballY += move_y; //promjena y koordinate loptice na novu za pomak

  //provjera sudara loptice i ruba canvasa
  if (ballX + radius > canvas.width || ballX - radius < 0) {
    //ako je loptica udarila u lijevi i li desni rub, promijeni smjer
    move_x = -move_x;
  }
  if (ballY - radius < yOffset) {
    //ako je loptica udarila u gornji rub, promijeni smjer
    move_y = -move_y;
  }
  if (ballY + radius > canvas.height) {
    //ukoliko loptica udari o donji rub canvasa, zavrsava igra
    cancleAnim = true;
    drawGameStateMSG(2); //1-WIN 2-Game Over
  }

  //provjera sudara loptice i palice
  if (
    //ako je loptica unutar x_pocetna i x_krajnja te unutar y_pocetna i y_krajnja od palic onda racunamo kao sudar
    ballX + radius >= stickX &&
    ballX - radius <= stickX + stickWidth &&
    ballY + radius >= stickY &&
    ballY - radius <= stickY + stickHeight
  ) {
    if (ballX > stickX && ballX < stickX + stickWidth) {
      move_y = -move_y; // promjena smjera loptice u y smjeru (gore/dolje) pri sudaru s palicom ako je pala izmedu x_pocetna i x_krajnja
    } else {
      move_x = -move_x; // promjena smjera loptice u x smjeru (lijevo/desno) pri sudaru s palicom
    }
  }

  //provjera sudara loptice i pojedine cigle
  bricks.forEach((brick, index) => {
    if (
      //ako je loptica unutar x_pocetna i x_krajnja te unutar y_pocetna i y_krajnja od cigle onda racunamo kao sudar
      ballX + radius >= brick.xPos &&
      ballX - radius <= brick.xPos + brickW &&
      ballY + radius >= brick.yPos &&
      ballY - radius <= brick.yPos + brickH
    ) {
      if (ballX > brick.xPos && ballX < brick.xPos + brickW) {
        move_y = -move_y; //promjena smjera y pozicije loptice pri sudaru s ciglom, vraća se u suprotnom smjeru (gore/dolje)
      } else {
        move_x = -move_x; //promjena smjera x pozicije loptice pri sudaru s ciglom, vraća se u suprotnom smjeru (lijevo/desno)
      }
      bricks.splice(index, 1); //brisanje sudarene cigle iz niza
      totalScore += 1; //uvecanje ukupnog broja ostvarenih bodova
      clearCanvas(); //brisanje cigle
    }
  });
}

function animate() {
  //animacija loptice
  if (totalScore == 30) {
    //ako je korisnik unistio sve cigle
    cancleAnim = true;
    drawGameStateMSG(1); //1-WIN 2-Game Over
  }
  if (cancleAnim == true) {
    if (localStorage.getItem("bestScore") == null) {
      //ako ne postoje bodovi onda spremi
      localStorage.setItem("bestScore", totalScore.toString());
    } else {
      //inace provjeri je li ostvaren veci broj bodova nego spremljeni
      if (totalScore > localStorage.getItem("bestScore")) {
        localStorage.setItem("bestScore", totalScore.toString());
      }
    }

    return cancelAnimationFrame(gameAnimation); //zaustavljanje animacije
  }
  drawBall();
  detectCollision();
  gameAnimation = requestAnimationFrame(animate); //stalno iznova pokretanje animacije
}

let buttonAgain = {
  //pozicija tipke za ponovno pokretanje igre
  xPos: (canvasWidth - 210) / 2,
  yPos: canvasHeight - 470,
  width: 200,
  height: 50,
};

//If game WON or GAME OVER
function drawGameStateMSG(state) {
  canvCtx.fillStyle = "#D9D9D9";
  canvCtx.shadowBlur = 30;
  canvCtx.fillRect((canvasWidth - 500) / 2, (canvasHeight - 300) / 2, 500, 300);
  canvCtx.fillStyle = "black";
  canvCtx.font = "bold 40px Verdana";
  if (state == 1) {
    //ako je korisnik pobijedio, sve cigle unistio, onda ispisi poruku
    canvCtx.fillStyle = "gold";
    canvCtx.fillText(
      "You're winner!",
      (canvasWidth - 320) / 2,
      (canvasHeight - 150) / 2
    );
    canvCtx.font = "bold 20px Verdana";
    canvCtx.fillStyle = "black";
    canvCtx.fillText(
      "Congratulation! You won. :)",
      (canvasWidth - 290) / 2,
      (canvasHeight - 50) / 2
    );
    canvCtx.fillText(
      `Total score: ${totalScore}`,
      (canvasWidth - 170) / 2,
      canvasHeight - 520
    );
    canvCtx.fillStyle = "gold";
    canvCtx.fillRect((canvasWidth - 210) / 2, canvasHeight - 470, 200, 50);
    canvCtx.fillStyle = "black";
    canvCtx.fillText("Play again", (canvasWidth - 125) / 2, canvasHeight - 440);
  } else {
    //ako je korisnik izgubio, loptica pala na donju granicu canvasa, onda ispisi poruku
    canvCtx.fillStyle = "red";
    canvCtx.fillText(
      "GAME OVER",
      (canvasWidth - 275) / 2,
      (canvasHeight - 150) / 2
    );
    canvCtx.font = "bold 20px Verdana";
    canvCtx.fillStyle = "black";
    canvCtx.fillText(
      "Try again. Good luck !)",
      (canvasWidth - 270) / 2,
      (canvasHeight - 50) / 2
    );
    canvCtx.fillText(
      `Total score: ${totalScore}`,
      (canvasWidth - 170) / 2,
      canvasHeight - 520
    );
    canvCtx.fillStyle = "red";
    canvCtx.fillRect((canvasWidth - 210) / 2, canvasHeight - 470, 200, 50);
    canvCtx.fillStyle = "white";
    canvCtx.fillText("Play again", (canvasWidth - 125) / 2, canvasHeight - 440);
  }
}

function handleClick(event) {
  var rectCanvas = canvas.getBoundingClientRect();
  var mouseX = event.clientX - rectCanvas.left;
  var mouseY = event.clientY - rectCanvas.top;
  if (
    mouseX > buttonAgain.xPos &&
    mouseX < buttonAgain.xPos + buttonAgain.width &&
    mouseY > buttonAgain.yPos &&
    mouseY < buttonAgain.yPos + buttonAgain.height
  ) {
    location.reload();
  }
}

canvas.addEventListener("click", handleClick);

window.onload = () => {
  animate(); //inicijalno crtanje loptice na sredini palice i pokretanje animacije
  initialDrawBricks(); //inicijalno crtanje cigli
  drawStick(stickX); //inicijalno crtanje palice na sredini
};
