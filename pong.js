var animate = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback) { window.setTimeout(callback, 1000/60) };

var canvas = document.createElement("canvas");
var width = 0.85 * window.innerWidth;
var height = 0.85 * window.innerHeight;
canvas.width = width;
canvas.height = height;
var context = canvas.getContext('2d');
var keysDown = {};

window.addEventListener("keydown", function(event) {
    keysDown[event.keyCode] = true;
});
window.addEventListener("keyup", function(event) {
    delete keysDown[event.keyCode];
});

window.onload = function() {
    document.body.appendChild(canvas);
    animate(step);
};

function Paddle(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.x_speed = 0;
    this.y_speed = 0;
};

Paddle.prototype.render = function() {
    context.fillStyle = "#FFFFFF";
    context.fillRect(this.x, this.y, this.width, this.height);
};

function Player() {
    this.paddle = new Paddle(width/2, height-20, 50, 10);
};

function Computer() {
    this.paddle = new Paddle(width/2, 10, 50, 10);
};

Player.prototype.render = function() {
    this.paddle.render();
};

Computer.prototype.render = function() {
    this.paddle.render();
};

Paddle.prototype.move = function(x, y) {
    this.x += x;
    this.y += y;
    this.x_speed = x;
    this.y_speed = y;

    // Paddle too far left
    if( this.x < 0 ) {
        this.x = 0;
        this.x_speed = 0;
    }

    // Paddle too far right
    else if( this.x + this.width > width ){
        this.x = width - this.width;
        this.x_speed = 0;
    }
};

Player.prototype.update = function() {
    for( var key in keysDown ) {
        var value = Number(key);

        // Left arrow
        if( value == 37 ) {
            this.paddle.move(-4, 0);
        }
        // Right arrow
        else if( value == 39 ) {
            this.paddle.move(4, 0);
        }
    }
};

Computer.prototype.update = function(ball) {
    var paddle_x = this.paddle.x + this.paddle.width/2
    var ball_x = ball.x
    var move = ball_x - paddle_x;

    // Limit the max movement of the paddle
    if( move > 4 ) {
        move = 4;
    }
    else if( move < -4 ) {
        move = -4;
    }
    this.paddle.move(move, 0);
};

function Ball(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 5;
    this.x_speed = 0;
    this.y_speed = 3;
};

Ball.prototype.render = function() {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    context.fillStyle = "#FFFFFF";
    context.fill();
};

Ball.prototype.update = function(top_paddle, bottom_paddle) {
    this.x += this.x_speed;
    this.y += this.y_speed;
    var left = this.x - this.radius;
    var bottom = this.y - this.radius;
    var right = this.x + this.radius;
    var top = this.y + this.radius;

    // Detect side wall collision
    if( left < 0 ) {
        this.x = this.radius;
        this.x_speed = -this.x_speed;
    }
    else if( right > width ) {
        this.x = width - this.radius;
        this.x_speed = -this.x_speed;
    }

    // Detect point scored
    if( top > height || bottom < 0 ) {
        this.x_speed = 0;
        this.y_speed = 3;
        this.x = width/2;
        this.y = height/2;
        // Reset paddles
        top_paddle.x = width/2;
        bottom_paddle.x = width/2;
    }

    // Detect top paddle hit
    if ((top > 350)
        && (top < (top_paddle.y + top_paddle.height))
        && (top > top_paddle.y)
        && (right > top_paddle.x)
        && (left < top_paddle.x + top_paddle.width)){
        this.x_speed += top_paddle.x_speed / 2;
        this.y_speed = -3;
        this.y += this.y_speed;
    }
    else if ((bottom < 50)
        && (bottom < (bottom_paddle.y + bottom_paddle.height))
        && (bottom > bottom_paddle.y)
        && (right > bottom_paddle.x)
        && (left < bottom_paddle.x + bottom_paddle.width)) {
        this.x_speed += bottom_paddle.x_speed / 2;
        this.y_speed = 3;
        this.y += this.y_speed;
    }
};

var player = new Player();
var computer = new Computer();
var ball = new Ball(width/2, height/2);

var step = function() {
    update();
    render();
    animate(step);
};

var update = function() {
    player.update();
    computer.update(ball);
    ball.update(player.paddle, computer.paddle);
};

var render = function() {
    context.fillStyle = "#000000";
    context.fillRect(0, 0, width, height);
    player.render();
    computer.render();
    ball.render();
};