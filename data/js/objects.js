var ball = function (x, y){
	this.x = x;
	this.y = y;
	this.r = cHeight*0.04;
	this.speed = cHeight*0.7;
	this.xDirection = 0;
	this.yDirection = 0;
	this.xTarget = x;
	this.yTarget = y;
	this.distance = 0;
	this.invulnerability = false;
	this.invulnerabilityTimer = 0;
	this.setInvulnerability = function(){
		this.invulnerability = true;
		this.invulnerabilityTimer = 4;
	}
	this.setTarget = function(x, y){
		this.xTarget = x;
		this.yTarget = y;
		this.distance = Math.sqrt((this.yTarget-this.y)*(this.yTarget-this.y) + (this.xTarget-this.x)*(this.xTarget-this.x));
		this.xDirection = (this.xTarget-this.x)/this.distance;
		this.yDirection = (this.yTarget-this.y)/this.distance;
	}
	this.drawInvulnerabilityNotification = function(){
		var r = cHeight*0.025;
		ctx.textBaseline="middle";
		ctx.textAlign="center";
		
		ctx.beginPath();
		ctx.font = 4*r + "px Monospace";
		ctx.fillStyle = "#f08047";
		ctx.fillText(this.invulnerabilityTimer, cWidth*0.5, cHeight*0.5 - r*3);
		
		ctx.beginPath();
		ctx.font = 1.5*r + "px Monospace";
		ctx.fillStyle = "#f08047";
		ctx.fillText("Invulnerability", cWidth*0.5, cHeight*0.5 + r);
	}
	this.draw = function(modifier){
		this.x += this.xDirection*this.speed*modifier;
		if (this.x<0) {
			this.x = 0;
			this.xDirection *= -1;
			noMargin = false;
		} else if (this.x>cWidth) {
			this.x = cWidth;
			this.xDirection *= -1;
			noMargin = false;
		}
		this.y += this.yDirection*this.speed*modifier;
		if (this.y<0) {
			this.y = 0;
			this.yDirection *= -1;
			noMargin = false;
		} else if (this.y>cHeight) {
			this.y = cHeight;
			this.yDirection *= -1;
			noMargin = false;
		}
		
		ctx.beginPath();
		if (this.invulnerability) {
			this.invulnerabilityTimer = (this.invulnerabilityTimer-modifier).toFixed(2);
			if (this.invulnerabilityTimer > 0) {
				this.drawInvulnerabilityNotification();
			} else {
				if (localStorage.coins >= 5)
					$('#bomb').removeClass('disabled');
				this.invulnerabilityTimer = 0;
				this.invulnerability = false;
				enemyKills = 0;
				notification = '';
			}
			
			ctx.shadowBlur=50;
			ctx.shadowColor="#f08047";
			ctx.strokeStyle="#f08047";
			ctx.fillStyle="#ffff80";
			ctx.lineWidth = 2;
		} else {
			ctx.fillStyle="#7bd827";
			ctx.strokeStyle="#000";
			ctx.lineWidth = 1;
		}
		
		ctx.arc(this.x, this.y,this.r,0,2*Math.PI);
		ctx.fill();
		ctx.stroke();
		ctx.shadowBlur=0;
	}
}

var target = function(){
	this.x = 0;
	this.y = 0;
	this.r = cHeight*0.035;
	this.spawn = function(){
		this.x = Math.floor(Math.random() * cWidth) + this.r;
		if (this.x>cWidth-this.r)
			this.x=cWidth-this.r;
		this.y = Math.floor(Math.random() * cHeight) + this.r;
		if (this.y>cHeight-4*this.r)
			this.y=cHeight-4*this.r;
		
		if (this.x>cWidth*0.5-2*this.r && 
			this.x<cWidth*0.5+2*this.r && 
			this.y>cHeight*0.5-2*this.r && 
			this.y<cHeight*0.5+2*this.r) 
			this.spawn(); //targets should not spawn in center
	}
	this.draw = function() {
		ctx.beginPath();
		ctx.fillStyle="#3a8bda";
		ctx.strokeStyle="#000";
		ctx.lineWidth = 1;
		ctx.arc(this.x, this.y,this.r,0,2*Math.PI);
		ctx.fill();
		ctx.stroke();
	}
}

var coin = function(){
	this.x = 0;
	this.y = 0;
	this.r = cHeight*0.035;
	this.glow = this.r;
	this.glowSpeed = this.r;
	this.spawn = function(){
		this.x = Math.floor(Math.random() * cWidth) + this.r;
		if (this.x>cWidth-this.r)
			this.x=cWidth-this.r;
		this.y = Math.floor(Math.random() * cHeight) + this.r;
		if (this.y>cHeight-4*this.r)
			this.y=cHeight-4*this.r;
	}
	this.draw = function(modifier) {
		this.glow += modifier*this.glowSpeed;
		if (this.glow > this.r){
			this.glow = this.r;
			this.glowSpeed *=-1;
		} else if (this.glow < this.r*0.5) {
			this.glow = this.r*0.5;
			this.glowSpeed *=-1;
		}
		
		ctx.beginPath();
		ctx.shadowBlur=this.glow;
		ctx.shadowColor="#ffff80";
		ctx.fillStyle="#ffff80";
		ctx.strokeStyle="#f08047";
		ctx.lineWidth = 1;
		ctx.arc(this.x, this.y,this.r,0,2*Math.PI);
		ctx.fill();
		ctx.stroke();
		ctx.shadowBlur=0;
		
		ctx.textBaseline="middle";
		ctx.textAlign="center";
		ctx.fillStyle = "#f08047";
		ctx.font = 1.2*this.r + "px Monospace";
		ctx.fillText('C', this.x-this.r*0.05, this.y+this.r*0.07);
	}
}

var enemy = function(){
	this.x = cWidth - player.x;
	this.y = cHeight - player.y;
	this.r = cHeight*0.02;
	this.speed = cHeight*((Math.random() * (0.7 - 0.1) + 0.1).toFixed(4));
	this.xDirection = -player.xDirection;
	this.yDirection = -player.yDirection;
	
	this.draw = function(modifier){
		this.x += this.xDirection*this.speed*modifier;
		if (this.x<0) {
			this.xDirection *= -1;
			this.x = 0;
		} else if (this.x>cWidth) {
			this.xDirection *= -1;
			this.x = cWidth;
		}
		
		this.y += this.yDirection*this.speed*modifier;
		if (this.y<0) {
			this.yDirection *= -1;
			this.y = 0;
		} else if (this.y>cHeight) {
			this.yDirection *= -1;
			this.y = cHeight;			
		}
		
		ctx.beginPath();		
		ctx.fillStyle="#f08047";
		ctx.arc(this.x, this.y,this.r,0,2*Math.PI);
		ctx.fill();
		ctx.strokeStyle="#000";
		ctx.lineWidth = 1;
		ctx.stroke();
		
	}
}

function drawScore() {
	var r = cHeight*0.025;
	ctx.textBaseline="middle";
	ctx.textAlign="center";
	
	ctx.beginPath();
	ctx.font = 2*r + "px Monospace";
	ctx.fillStyle = "#8db0d3";
	ctx.fillText('Score ' + score, cWidth*0.5, r*2);
	ctx.fillStyle = "#7bd827";
	ctx.fillText('     :' + strToSpace(score), cWidth*0.5, r*2);
}

function drawNotification(msg){
	if (msg) {
		var r = cHeight*0.025;
		ctx.textBaseline="middle";
		ctx.textAlign="center";
		
		ctx.beginPath();
		ctx.font = 4*r + "px Monospace";
		ctx.fillStyle = "#ccc";
		ctx.fillText(msg, cWidth*0.5, cHeight*0.5 - r*3);
		ctx.fillStyle = "#7bd827";
		ctx.fillText('|' + strToSpace(msg) + '|', cWidth*0.5, cHeight*0.5 - r*3);
	}
}

function strToSpace(str){
	var aux = '';
	for (i=0; i<str.toString().length; i++)
		aux+=' ';
	return aux;
}

var getPhoneGapPath = function() {
	var path = window.location.pathname;
	path = path.substr( path, path.length - 10 );
	return path;
};
//background snd
function onSuccess() {}
function onError(error) {}
function onStatus(status) {
	if( status==Media.MEDIA_STOPPED ) {
		snd.play();
	}
}

function startGame() {
	enemies.length = 0;
	player = new ball(cWidth*0.5, cHeight*0.5);
	t = null;
	c = null;
	notification = 'tap the screen to move';
	score = 0;
	appPaused = false;
	
	then = Date.now();
	loop();
}

function fontFix(){
	globalR = cHeight*0.025;
	
	$('body').css({'fontSize' : globalR*2});
	$('#menu ul .fa').css({'width' : globalR*4});
	$('#bomb').css({'width' : globalR*5.5, 'height' : globalR*4.5 });
	$('#bomb div').css({'width' : globalR*3, 'height' : globalR*2.5, 'paddingTop' : globalR*0.5});
	$('#centerMenu').css({'margin-top' : cHeight*0.5-$('#centerMenu').height()*0.5});
}

function doLogin(callback) {
	if (typeof(window.plugins.playGamesServices) != "undefined") {
		window.plugins.playGamesServices.isSignedIn(function (result) {
			if (result.isSignedIn) {
				// show user if logged in
				window.plugins.playGamesServices.showPlayer(function (playerData) {
					$('.hidden').fadeIn(0);
				});
				submitHighscore(localStorage.highscore);
			} else {
				// login and then show user
				window.plugins.playGamesServices.auth(function(){
					window.plugins.playGamesServices.showPlayer(function (playerData) {
						localStorage.isLogin = 'true';
						$('.hidden').fadeIn(0);
					});
					submitHighscore(localStorage.highscore);
				}, function(){
					alert("Can't connect to the internet. Your score will not be saved on our leaderboard.");
					$('#autoLogin .fa').removeClass('fa-user').addClass('fa-user-times');
					$('#autoLogin span').html('off');
					localStorage.isLogin = 'false';
				});
			}
		});
	}
}

function doAchievement(aID){
	if (localStorage.isLogin == 'true' && typeof(window.plugins.playGamesServices) != "undefined") {
		var data = {
			achievementId: aID
		};
		window.plugins.playGamesServices.unlockAchievement(data);
	}
}

function submitHighscore(x) {
	if (typeof(window.plugins.playGamesServices) != "undefined") {
		var data = {
			score: x,
			leaderboardId: "CgkI_7ufk-EKEAIQAQ"
		};
		window.plugins.playGamesServices.submitScore(data);
	}
}