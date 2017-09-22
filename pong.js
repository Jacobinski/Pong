var animate = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback) { window.setTimeout(callback, 1000/60) };

var canvas = document.createElement('canvas');
var width = 400;
var height = 600;
canvas.width = width;
canvas.height = height;
var context = canvas.getContext('2d');

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
    this.paddle = new Paddle(175, 580, 50, 10);
};

function Computer() {
    this.paddle = new Paddle(175, 10, 50, 10);
};

Player.prototype.render = function() {
    this.paddle.render();
};

Computer.prototype.render = function() {
    this.paddle.render();
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
    if (left < 0) {
        this.x = this.radius;
        this.x_speed = -this.x_speed;
    }
    else if (right > width) {
        this.x = width - this.radius;
        this.x_speed = -this.x_speed;
    }

    // Detect point scored
    if (top > height || bottom < 0) {
        this.x_speed = 0;
        this.y_speed = 3;
        this.x = 200;
        this.y = 300;
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
var ball = new Ball(200, 300);

var step = function() {
    update();
    render();
    animate(step);
};

var update = function() {
    ball.update(player.paddle, computer.paddle);
};

var render = function() {
    context.fillStyle = "#000000";
    context.fillRect(0, 0, width, height);
    player.render();
    computer.render();
    ball.render();
};