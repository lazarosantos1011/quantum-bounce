let bola;
let raqueteJogador;
let raqueteComputador;
let fundoImg;
let imgLargura, imgAltura;
let bounceSound;
let scoreSound;
const barraEspessura = 5;

// Variáveis para o placar
let pontosJogador = 0;
let pontosComputador = 0;

let gameStarted = false; // Variável para controlar o estado do jogo

document.getElementById('start-button').addEventListener('click', function() {
      // Chama a função setup() e esconde o botão
      setup();
      this.style.display = 'none';
});

function preload() {
  fundoImg = loadImage('./Sprites/fundo1.png');
  bolaImg = loadImage('./Sprites/bola.png');
  raqueteJogadorImg = loadImage('./Sprites/barra01.png');
  raqueteComputadorImg = loadImage('./Sprites/barra02.png');
  bounceSound = loadSound('./Sounds/446100__justinvoke__bounce.wav');
  scoreSound = loadSound('./Sounds/173859__jivatma07__j1game_over_mono.wav');
}

function setup() {
  createCanvas(800, 400);
  textSize(16); // Define o tamanho do texto
  textFont('Comic Sans MS');
  textAlign(CENTER, CENTER); // Alinha o texto ao centro
  noLoop();
}

function startGame() {
  bola = new Bola();
  raqueteJogador = new Raquete(true);
  raqueteComputador = new Raquete(false);
  bounceSound.setVolume(0.3);
  scoreSound.setVolume(0.20);
  gameStarted = true;
  loop(); // Inicia o draw
}

function draw() {
  if(!gameStarted) return;
      
  let imgAspect = fundoImg.width / fundoImg.height;
  let canvasAspect = width / height;

  let srcX, srcY, srcW, srcH;
  if (imgAspect > canvasAspect) {
    srcH = fundoImg.height;
    srcW = fundoImg.height * canvasAspect;
    srcY = 0;
    srcX = (fundoImg.width - srcW) / 2;
  } else {
    srcW = fundoImg.width;
    srcH = fundoImg.width / canvasAspect;
    srcX = 0;
    srcY = (fundoImg.height - srcH) / 2;
  }
  
  image(fundoImg, 0, 0, width, height, srcX, srcY, srcW, srcH);
  
  fill(color("#2B3FD6"));
  noStroke();
  rect(0, 0, width, barraEspessura); // Barra superior
  rect(0, height - barraEspessura, width, barraEspessura); // Barra inferior

  bola.atualizar();
  bola.mostrar();
  bola.checarRaquete(raqueteJogador);
  bola.checarRaquete(raqueteComputador);

  raqueteJogador.atualizar();
  raqueteJogador.mostrar();

  raqueteComputador.moverAI();
  raqueteComputador.mostrar();
  
  // Desenha o placar
  fill(255); // Cor branca para o texto do placar
  text(`You: ${pontosJogador} - Computer: ${pontosComputador}`, width / 2, height / 15);
}

class Bola {
  constructor() {
    this.resetar();
    this.raio = 10;
    this.raioOriginal = this.raio;
    this.esmagada = false;
    this.timerEsmagamento = 0;
  }

  resetar() {
    this.angulo = 0;
    this.x = width / 2;
    this.y = height / 2;
    this.velocidadeX = random([-5, 5]);
    this.velocidadeY = random([-3, 3]);
    if(scoreSound.isLoaded) {
      scoreSound.play();
    }
  }

  atualizar() {
    let proximoX = this.x + this.velocidadeX;
    let proximoY = this.y + this.velocidadeY;

    if (proximoY < barraEspessura || proximoY > height - barraEspessura) {
      this.velocidadeY *= -1;
    }

    if (proximoX < 0) {
      pontosComputador++;
      this.resetar();
      narrarPlacar();
    }

    if (proximoX > width) {
      pontosJogador++;
      this.resetar();
      narrarPlacar();
    }

    this.checarColisaoContinua(raqueteJogador);
    this.checarColisaoContinua(raqueteComputador);

    this.x += this.velocidadeX;
    this.y += this.velocidadeY;

    if (this.esmagada) {
      this.timerEsmagamento--;
      if (this.timerEsmagamento <= 0) {
        this.esmagada = false;
        this.raio = this.raioOriginal;
      }
    }

    let velocidade = sqrt(this.velocidadeX * this.velocidadeX + this.velocidadeY * this.velocidadeY);
    this.angulo += velocidade * 0.01;
}

  checarRaquete(raquete) {
    if (this.x < raquete.x + raquete.largura && this.x > raquete.x &&
        this.y > raquete.y && this.y < raquete.y + raquete.altura) {

      let relY = (this.y - (raquete.y + raquete.altura / 2)) / (raquete.altura / 2);
      let maxIncline = PI / 4;
      let angle = relY * maxIncline;
      let speed = sqrt(this.velocidadeX * this.velocidadeX + this.velocidadeY * this.velocidadeY);
      this.velocidadeX = speed * cos(angle) * (this.velocidadeX > 0 ? -1 : 1);
      this.velocidadeY = speed * sin(angle);
      this.velocidadeX *= 1.1;
      this.velocidadeY *= 1.1;
      this.x = raquete.isJogador ? raquete.x + raquete.largura : raquete.x - this.raio;
      this.esmagada = true;
      this.raio = this.raioOriginal / 1.5;
      this.timerEsmagamento = 10;

      if (bounceSound.isLoaded()) {
        bounceSound.play();
      }
    }
  }

  checarColisaoContinua(raquete) {
    let distX = this.velocidadeX;
    let distY = this.velocidadeY;

    let steps = max(abs(distX), abs(distY));
    let stepX = distX / steps;
    let stepY = distY / steps;

    for (let i = 0; i <= steps; i++) {
      let tempX = this.x + i * stepX;
      let tempY = this.y + i * stepY;

      if (tempX < raquete.x + raquete.largura && tempX > raquete.x &&
          tempY > raquete.y && tempY < raquete.y + raquete.altura) {
        
        let relY = (tempY - (raquete.y + raquete.altura / 2)) / (raquete.altura / 2);
        let maxIncline = PI / 4;
        let angle = relY * maxIncline;
        let speed = sqrt(this.velocidadeX * this.velocidadeX + this.velocidadeY * this.velocidadeY);
        this.velocidadeX = speed * cos(angle) * (this.velocidadeX > 0 ? -1 : 1);
        this.velocidadeY = speed * sin(angle);
        this.velocidadeX *= 1.1;
        this.velocidadeY *= 1.1;
        this.x = raquete.isJogador ? raquete.x + raquete.largura : raquete.x - this.raio;
        this.esmagada = true;
        this.raio = this.raioOriginal / 1.5;
        this.timerEsmagamento = 10;

        if (bounceSound.isLoaded()) {
          bounceSound.play();
        }
        break;
      }
    }
  }
  
  mostrar() {
    let escala = (this.raio * 2) / 318;
    let largura = bolaImg.width * escala;
    let altura = bolaImg.height * escala;
    push();
    translate(this.x, this.y);
    rotate(this.angulo);
    imageMode(CENTER);
    image(bolaImg, 0, 0, largura, altura);
    pop();
  }
}

class Raquete {
  constructor(isJogador) {
    this.largura = 10;
    this.altura = 40;
    this.x = isJogador ? 20 : width - 30;
    this.y = height / 2 - this.altura / 2;
    this.isJogador = isJogador;
  }

  atualizar() {
    if (this.isJogador) {
      this.y = constrain(mouseY - this.altura / 2, barraEspessura, height - this.altura - barraEspessura);
    }
  }

  moverAI() {
    if (!this.isJogador) {
      let targetY = bola.y - this.altura / 2;
      this.y += (targetY - this.y) * 1;
      this.y = constrain(this.y, barraEspessura, height - this.altura - barraEspessura);
    }
  }

  resetarPosicao() {
    if (!this.isJogador) {
      this.y = random(barraEspessura, height - this.altura - barraEspessura);
    }
  }

  mostrar() {
    let escala = this.altura / 400;
    let largura = raqueteJogadorImg.width * escala;
    let altura = raqueteJogadorImg.height * escala;
    image(this.isJogador ? raqueteJogadorImg : raqueteComputadorImg, this.x, this.y, largura, altura);
  }
}

/*
function corAleatoriaRGB() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

const corRaqueteJogador = corAleatoriaRGB();
const corRaqueteComputador = corAleatoriaRGB();
console.log(corRaqueteJogador, corRaqueteComputador);
*/

// Função para narrar o placar
function narrarPlacar() {
  const mensagem = `${pontosJogador} a ${pontosComputador}`;
  const sintetizador = window.speechSynthesis;
  const fala = new SpeechSynthesisUtterance(mensagem);
  fala.lang = 'en'; // Define o idioma para português (ajuste conforme necessário)
  sintetizador.speak(fala);
}
