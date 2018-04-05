
window.onload = function() {
  document.getElementById("start-button").addEventListener("click", startGame)
}

var time;

function startGame(){
    document.getElementById("start-button").style.display = "none";
    let canvas = document.getElementById("snake-game");
    let context = canvas.getContext("2d");
    let squareSize = Math.sqrt(canvas.width);
    game = new Game(canvas, context, squareSize);
    document.addEventListener("keydown",function(evt) {
    	switch(evt.keyCode) { // The conditions prevents the snake going backwards
    		case 37:
          if(game.xv == 1) break;
          else game.setSnakeVelocity(-1,0);
    			break;
    		case 38:
          if(game.yv == 1) break;
          else game.setSnakeVelocity(0,-1);
    			break;
    		case 39:
          if(game.xv == -1) break;
          else game.setSnakeVelocity(1,0);
    			break;
    		case 40:
          if(game.yv == -1) break;
          else game.setSnakeVelocity(0,1);
    			break;
    	}
    });

    document.getElementById("k-left").addEventListener("click", function(evt){
      if(game.xv == 1) return;
      else game.setSnakeVelocity(-1,0);
    });

    document.getElementById("k-up").addEventListener("click", function(evt){
      if(game.yv == 1) return;
      else game.setSnakeVelocity(0,-1);
    });

    document.getElementById("k-right").addEventListener("click", function(evt){
      if(game.xv == -1) return;
      else game.setSnakeVelocity(1,0);
    });

    document.getElementById("k-down").addEventListener("click", function(evt){
      if(game.yv == -1) return;
      else game.setSnakeVelocity(0,1);
    });

    function gameLoop(){
      game.context.clearRect(0,0,game.canvas.width,game.canvas.height);
      game.update();
      game.updateScore();
      time = setTimeout(gameLoop, game.gameSpeed);
      if(game.gameOver) clearTimeout(time);
    }
    gameLoop();
}

class Game{

	constructor(canvas, context, squareSize){
    this.gameSpeed = 50;
		this.canvas = canvas;
		this.context = context;
		this.squareSize = squareSize;
    this.context.fillStyle="#9ac504";
		this.context.fillRect(0,0,this.canvas.width, this.canvas.height);
    this.score = 0;
    this.xv = 1;
    this.yv = 0;
    this.snake = new Snake(randomCoordinates(this.squareSize), randomCoordinates(this.squareSize));
    this.apple = new Apple(randomCoordinates(this.squareSize), randomCoordinates(this.squareSize));
    this.turtle = new Turtle();
    this.apple.spawn(this.context, this.squareSize, randomCoordinates(this.squareSize), randomCoordinates(this.squareSize));
    this.gameOverScreen = "";
    this.isTurtleAlive = false;
    this.turtleSpawnTime = null;
    this.turtleCountdown = null;
    this.turtleTimeLeft = 10;
    this.turtleEffect = false;
    this.turtleTimer = 0;
    this.gameOver = false;
	}

	update(){
    this.snake.move(this.xv, this.yv);
    this.snake.shiftSide(this.squareSize);
    for(let i=0; i < this.snake.trail.length; i++) {
      this.context.fillRect(this.snake.trail[i].x * this.squareSize, this.snake.trail[i].y * this.squareSize, this.squareSize, this.squareSize);
      if(this.snake.trail[i].x == this.snake.sx && this.snake.trail[i].y == this.snake.sy) { // Game over condition
        this.gameOver = true;
        document.getElementById("timer").innerText = 0;
        this.gameOverScreen = `<div class="gameover" id="gameover">
                                  <p>Your score:</p>
                                  <h4>${this.score}</h4>
                                  <p>Play again?</p>
                                  <div id="playAgain-button"><i class="material-icons">replay</i></div>
                                  <button type="button" id="share-button">Share score</button>`;
        document.getElementById("menu").insertAdjacentHTML("beforeend", this.gameOverScreen);
        document.getElementById("playAgain-button").firstChild.addEventListener("click", function(){
          document.getElementById("gameover").outerHTML = "";
          startGame();
        });
      }
    }

    this.snake.trail.push( {x:this.snake.sx, y:this.snake.sy} );

    while(this.snake.trail.length > this.snake.tail) { // Clear the last tail rect to give a movement sensation
      this.snake.trail.shift();
    }

    if(this.apple.ax == this.snake.sx && this.apple.ay == this.snake.sy) { // If the snake eats the apple
      this.score += 10; // +10 score for apples
      this.snake.tail++; // Tail increases
      if(Math.random() < 0.2 && this.isTurtleAlive == false){ // Turtle has 20% chance to be spawn after the snake eats an apple
        this.turtle.spawn(this.context, this.squareSize);
        this.isTurtleAlive = true;
        this.turtleSpawnTime = new Date().getTime();
      }
      this.apple.spawn(this.context, this.squareSize);
    }
    if(this.isTurtleAlive == true && this.snake.sx == this.turtle.tx && this.snake.sy == this.turtle.ty){ // Activate slow motion
      this.score += 5; // +5 score for turtles
      this.turtle.die();
      this.isTurtleAlive = false;
      this.turtleEffect = true;
      this.gameSpeed = 150;
      this.turtleCountdown = new Date().getTime()
    }
    else this.context.fillRect(this.apple.ax * this.squareSize, this.apple.ay*this.squareSize, this.squareSize, this.squareSize);

    if(this.isTurtleAlive && (this.turtleSpawnTime + 7000) - new Date().getTime() > 0){
        this.turtle.draw(this.context, this.squareSize);
    }else{
      this.turtle.die();
      this.isTurtleAlive = false;
    }

    if(this.turtleEffect){
      this.turtleTimer = parseInt( ( ( (this.turtleCountdown + 5000) - new Date().getTime()) / 1000 ) +1);
      document.getElementById("timer").innerText = this.turtleTimer;
      if( (this.turtleCountdown + 5000) - new Date().getTime() < 0){
        this.turtleEffect = false;
        this.gameSpeed = 50;
        this.turtleTimer = 0;
      }
    }

	}

  setSnakeVelocity(xv, yv){
    this.xv = xv;
    this.yv = yv;
  }

  updateScore(){
    document.getElementById("score").innerText = this.score;
  }

}

class Snake {

	constructor(sx, sy){
		this.sx = sx;
		this.sy = sy;
    this.tail = 5;
    this.trail = [];
	}

	move(xv, yv){
		this.sx += xv;
		this.sy += yv;
	}

  shiftSide(squareSize){
    if(this.sx < 0) {
      this.sx = squareSize-1;
    }
    if(this.sx > squareSize-1) {
      this.sx= 0;
    }
    if(this.sy < 0) {
      this.sy = squareSize-1;
    }
    if(this.sy > squareSize-1) {
      this.sy= 0;
    }
  }

}

class Apple {

	constructor(ax, ay){
		this.ax = ax;
		this.ay = ay;
	}

	spawn(context, squareSize){
		this.ax=  randomCoordinates(squareSize);
		this.ay=  randomCoordinates(squareSize);
		context.fillStyle="#060a09";
		context.fillRect(this.ax * squareSize, this.ay * squareSize, squareSize, squareSize);
	}

}

class Turtle {

  constructor(){
    this.tx = null;
    this.ty = null;
    this.img = new Image();
    this.img.src = "assets/img/turtle.png";
  }

  spawn(context, squareSize){
    this.tx=  randomCoordinates(squareSize);
    this.ty=  randomCoordinates(squareSize);
    context.fillStyle="#060a09";
    context.drawImage(this.img, this.tx * squareSize, this.ty * squareSize);
  }

  draw(context, squareSize){
    context.drawImage(this.img, this.tx * squareSize, this.ty * squareSize);
  }

  die(){
    this.tx = null;
    this.ty = null;
  }


}

function randomCoordinates(squareSize){
  return Math.floor(Math.random() * squareSize);
}
