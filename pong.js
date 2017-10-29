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
    this.paddle = new Paddle(10, height/2, 10, 50);
};

function Computer() {
    this.paddle = new Paddle(width - 20, height/2, 10, 50);
};

Player.prototype.render = function() {
    this.paddle.render();
};

Computer.prototype.render = function() {
    this.paddle.render();
};

Paddle.prototype.move = function(x, y) {
    // TODO: There is a bug where the paddle keeps speed while not movign
    //       -> Gently declerate it in update

    this.x_speed = x;
    this.y_speed = y;
    this.x += this.x_speed;
    this.y += this.y_speed;

    // Paddle too far up
    if( this.y < 0 ) {
        this.y = 0;
        this.y_speed = 0;
    }
    // Paddle too far down
    else if( this.y + this.height > height ){
        this.y = height - this.height;
        this.y_speed = 0;
    }
};

Player.prototype.update = function() {
    for( var key in keysDown ) {
        var value = Number(key);

        // Up arrow
        if( value == 38 ) {
            this.paddle.move(0, -4);
        }
        // Right arrow
        else if( value == 40 ) {
            this.paddle.move(0, 4);
        }
    }
};

Computer.prototype.update = function(ball) {
    var paddle_y = this.paddle.y + this.paddle.height/2
    var ball_y = ball.y
    var move = ball_y - paddle_y;

    // Limit the max movement of the paddle
    if( move > 4 ) {
        move = 4;
    }
    else if( move < -4 ) {
        move = -4;
    }
    this.paddle.move(0, move);
};

function Ball(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 5;
    this.x_speed = -3;
    this.y_speed = 0;
};

Ball.prototype.render = function() {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    context.fillStyle = "#FFFFFF";
    context.fill();
};

Ball.prototype.update = function(left_paddle, right_paddle) {
    this.x += this.x_speed;
    this.y += this.y_speed;
    var left = this.x - this.radius;
    var top = this.y - this.radius;
    var right = this.x + this.radius;
    var bottom = this.y + this.radius;

    // Detect side wall collision
    if( top < 0 ) {
        this.y = this.radius;
        this.y_speed = -this.y_speed;
    }
    else if( bottom > height ) {
        this.y = height - this.radius;
        this.y_speed = -this.y_speed;
    }

    // Detect point scored
    if( left < 0 || right > width ) {
        this.x_speed = -3;
        this.y_speed = 0;
        this.x = width/2;
        this.y = height/2;
        // Reset paddles
        left_paddle.y = height/2;
        right_paddle.y = height/2;
    }

    // Detect left paddle hit
    if ((left < 50)
        && (left < (left_paddle.x + left_paddle.width))
        && (left > left_paddle.x)
        && (top < (left_paddle.y + left_paddle.height))
        && (bottom > left_paddle.y))
    {
        this.x_speed = 3;
        this.y_speed += left_paddle.y_speed / 2;
        this.x += this.x_speed;
    }
    else if ((right > width - 50)
        && (right > right_paddle.x)
        && (right < (right_paddle.x + right_paddle.width))
        && (top < (right_paddle.y + right_paddle.height))
        && (bottom > right_paddle.y))
    {
        this.y_speed += right_paddle.y_speed / 2;
        this.x_speed = -3;
        this.x += this.x_speed;
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