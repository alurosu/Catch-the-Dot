var appPaused = true;

var cWidth;	  //canvas width
var cHeight;  //canvas height
var ctx; 		  //canvas context
var canvas;
var then;
var player;
var enemies = new Array();
var t;
var c;
var score = 0;
var notification;
var globalR;
var snd = null;
var sndScore = null;
var sndCoin = null;
var canBuy = false;
var notUsedInv = true;
var noMargin = true;
var coinsThisGame = 0;
var enemyKills = 0;

if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
	document.addEventListener("deviceready", onDeviceReady, false);
} else {
	$(document).ready(function(){
		onDeviceReady();
	});
}

function onDeviceReady(){
	gpurl = getPhoneGapPath();
	if (typeof Media != 'undefined') {
		snd = new Media(gpurl + "data/audio/background.mp3", onSuccess, onError, onStatus);
		
		sndScore = new Media(gpurl + "data/audio/hit.mp3");
		sndCoin = new Media(gpurl + "data/audio/pu1.mp3");
		
		if (localStorage.sound == 'off') {
			//sound is off
			$('#volume .fa').removeClass('fa-volume-up').addClass('fa-volume-off');
			snd.stop();
		} else {
			//sound is on or default
			localStorage.sound == 'on';
			$('#volume .fa').removeClass('fa-volume-off').addClass('fa-volume-up');
			snd.play();
		}
	}
	
	if (!localStorage.coins)
		localStorage.coins = 0;
	$("#totalCoins span").html(localStorage.coins);
	
	if (!localStorage.isLogin)
		localStorage.isLogin = 'true';
	
	if (!localStorage.highscore)
		localStorage.highscore = 0;
	$('#highscore span').html(localStorage.highscore);
	
	if (localStorage.isLogin == 'true') {
		$('#autoLogin .fa').removeClass('fa-user-times').addClass('fa-user');
		$('#autoLogin span').html('on');
		doLogin();
	} else {
		$('#autoLogin .fa').removeClass('fa-user').addClass('fa-user-times');
		$('#autoLogin span').html('off');
	}
	
	init(); 
	var clickHandler = ('ontouchstart' in document.documentElement ? "touchstart" : "mousedown");
	$('canvas').on(clickHandler, function(e) {
		var x = e.originalEvent.touches?e.originalEvent.touches[0].pageX:e.clientX;
		var y = e.originalEvent.touches?e.originalEvent.touches[0].pageY:e.clientY;
		player.setTarget(x,y);		
		
		if (!t) {
			t = new target();
			t.spawn();
			notification = 'catch the blue dot';
		}
	});
	
	$('#rate').on(clickHandler, function(e) {
		openBrowser("market://details?id=alurosu.games.catchthedot");
	});
	
	$('#bomb').on(clickHandler, function(e) {
		if (localStorage.coins<5)
			notification = 'you need 5 coins';
		else if (enemies.length<5)
			notification = 'you need 5 enemies';
		else if (!player.invulnerability) {
			localStorage.coins -= 5;
			$("#totalCoins span").html(localStorage.coins);
			$('#bomb').addClass('disabled');
			notification = '     ';
			player.setInvulnerability();
			notUsedInv = false;
		}
	});
	
	$('#share').on(clickHandler, function(e) {
		alert('do share');
		var options = {
		  message: "My best score in Catch the Dot is " + localStorage.highscore + "! Can you beat me? http://bit.ly/CatchTheDot",
		  subject: "Catch the Dot Highscore",
		  url: 'http://bit.ly/CatchTheDot',
		  chooserTitle: 'Catch the Dot',
		  appPackageName: 'alurosu.games.catchthedot'
		};
		 
		var onSuccess = function(result) {
		  alert("Share completed? " + result.completed);
		  alert("Shared to app: " + result.app);
		};
		 
		var onError = function(msg) {
		  alert("Sharing failed with message: " + msg);
		};
		 
		window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
		alert('share worked');
	});
	
	inAppPurchase
	.getProducts(['50coins'])
	.then(function (products) {
		console.log(products);
	})
	.catch(function (err) {
		alert(JSON.stringify(err));
	});
	
	$('#buyCoins').on(clickHandler, function(e) {
		inAppPurchase
		.buy('50coins')
		.then(function (data) {
			// ...then mark it as consumed:
			return inAppPurchase.consume(data.productType, data.receipt, data.signature);
		})
		.then(function () {
			localStorage.coins = parseInt(localStorage.coins) + 50;
			$("#totalCoins span").html(localStorage.coins);
			alert("You now own " + localStorage.coins + " coins.");
			// add helper achievement
			doAchievement("CgkI_7ufk-EKEAIQCg");
			
			if (localStorage.coins>=50) doAchievement("CgkI_7ufk-EKEAIQDA");
			if (localStorage.coins>=200) doAchievement("CgkI_7ufk-EKEAIQDg");
			if (localStorage.coins>=500) doAchievement("CgkI_7ufk-EKEAIQDQ");
		})
		.catch(function (err) {
			alert(JSON.stringify(err));
		});
	});
	
	$('#settings').on(clickHandler, function(e) {
		$('#menu ul').fadeToggle();
		e.stopPropagation();
	});
	
	$('#menu').on(clickHandler, function (e){
		//close settings
		var container = $("#menu ul");
		if (!container.is(e.target) && container.has(e.target).length === 0) {
			container.fadeOut();
		}
	});
	
	$('#volume').on(clickHandler, function(e) {
		if (typeof Media != 'undefined') {
			if (localStorage.sound == 'on') {
				//sound goes off
				localStorage.sound = 'off';
				$('#volume .fa').removeClass('fa-volume-up').addClass('fa-volume-off');
				snd.pause();
			} else {
				//sound goes on
				localStorage.sound = 'on';
				$('#volume .fa').removeClass('fa-volume-off').addClass('fa-volume-up');
				snd.play();
			}
		}
	});
	
	$("#leaderboard").on(clickHandler, function(e) {
		if (localStorage.isLogin == 'true') {
			var dt = {
				leaderboardId: "CgkI_7ufk-EKEAIQAQ"
			};
			window.plugins.playGamesServices.showLeaderboard(dt);
		}
	});
	
	$("#highscore").on(clickHandler, function(e) {
		if (localStorage.isLogin == 'true') {
			var dt = {
				leaderboardId: "CgkI_7ufk-EKEAIQAQ"
			};
			window.plugins.playGamesServices.showLeaderboard(dt);
		} else {
			window.plugins.playGamesServices.auth(function(){
				window.plugins.playGamesServices.showPlayer(function (playerData) {
					localStorage.isLogin = 'true';
					$('.hidden').fadeIn(0);
					var dt = {
						leaderboardId: "CgkI_7ufk-EKEAIQAQ"
					};
					window.plugins.playGamesServices.showLeaderboard(dt);
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
	
	$("#achievements").on(clickHandler, function(e) {
		if (localStorage.isLogin == 'true') {
			window.plugins.playGamesServices.showAchievements();
		}
	});
	
	$('#play').on(clickHandler, function(e) {
		$('#menu').fadeOut(0);
		startGame();
	});
	
	$('#autoLogin').on(clickHandler, function(e) {
		if (localStorage.isLogin == 'false') {
			$('#autoLogin .fa').removeClass('fa-user-times').addClass('fa-user');
			$('#autoLogin span').html('on');
			localStorage.isLogin = 'true';
			doLogin();
		}	else {
			$('#autoLogin .fa').removeClass('fa-user').addClass('fa-user-times');
			$('#autoLogin span').html('off');
			$('.hidden').fadeOut(0);
			localStorage.isLogin = 'false';
			window.plugins.playGamesServices.signout();
		}
	});
	
}

function init() {
	canvas = $("#canvas").get(0);
	canvas.width = cWidth = $("body").width();
	canvas.height = cHeight = $("body").height();
	$('#canvas').height(cHeight);
	fontFix();
	
	ctx = canvas.getContext("2d");
	var w = window;
	requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame || function(f){window.setTimeout(f,1000/60)};
}

function loop() {
	ctx.beginPath();
	ctx.fillStyle = "#112435";
	ctx.fillRect(0, 0, cWidth, cHeight);
	
	var now = Date.now();
	var delta = now - then;
	then = now;
	update(delta / 1000);

	if(appPaused == false)
		requestAnimationFrame(loop);
};

function update(modifier) {
	drawScore();
	drawNotification(notification);
	player.draw(modifier);
	
	if (t) {
		if (Math.sqrt((t.x-player.x)*(t.x-player.x) + (t.y-player.y)*(t.y-player.y)) < t.r+player.r) {
			enemies.push(new enemy());
			if (localStorage.coins>=5 && enemies.length>=5 && !player.invulnerability)
				$('#bomb').removeClass('disabled');
			if (enemies.length<2)
				notification = 'avoid the red dots';
			else if (!player.invulnerability) notification = '';
			if (!c && enemies.length%3==2) {
				c = new coin();
				c.spawn();
				setTimeout(function(){ c=null; }, 3000);
			}
			score++;
			if (localStorage.sound == "on" && typeof Media != 'undefined')
				sndScore.play();
			if (score == 10) doAchievement("CgkI_7ufk-EKEAIQAw");
			else if (score == 15) {
				doAchievement("CgkI_7ufk-EKEAIQBA");
				if (notUsedInv)
					doAchievement("CgkI_7ufk-EKEAIQDw");
				if (noMargin)
					doAchievement("CgkI_7ufk-EKEAIQBw");
			}
			else if (score == 20) doAchievement("CgkI_7ufk-EKEAIQBQ");
			else if (score >= 25) doAchievement("CgkI_7ufk-EKEAIQBg");
			
			t.spawn();
		}
		t.draw();
	}
	if (c) {
		if (Math.sqrt((c.x-player.x)*(c.x-player.x) + (c.y-player.y)*(c.y-player.y)) < c.r+player.r) {
			c.x=c.y=-2*player.r;
			localStorage.coins++;
			$("#totalCoins span").html(localStorage.coins);
			coinsThisGame++;
			if (localStorage.sound == "on" && typeof Media != 'undefined')
				sndCoin.play();
			if (coinsThisGame>=5)	doAchievement("CgkI_7ufk-EKEAIQCA");
			if (localStorage.coins>=50) doAchievement("CgkI_7ufk-EKEAIQDA");
			else if (localStorage.coins>=200) doAchievement("CgkI_7ufk-EKEAIQDg");
			else if (localStorage.coins>=500) doAchievement("CgkI_7ufk-EKEAIQDQ");
			
			if (localStorage.coins>=5 && enemies.length>=5 && !player.invulnerability)
				$('#bomb').removeClass('disabled');
		} else c.draw(modifier);
	}
	
	for (var i=0; i<enemies.length; i++) {
		enemies[i].draw(modifier);
		if (Math.sqrt((enemies[i].x-player.x)*(enemies[i].x-player.x) + (enemies[i].y-player.y)*(enemies[i].y-player.y)) < enemies[i].r+player.r) {
			if (player.invulnerability == true) {
				//destroy enemy
				if (localStorage.sound == "on" && typeof Media != 'undefined') {
					var sndBum = new Media(gpurl + "data/audio/bum.mp3");
					sndBum.play();
				}
				enemies.splice(i, 1);
				if (enemies.length<5) {
					$('#bomb').addClass('disabled');
				}
				enemyKills++;
				if(enemyKills >= 5)
					doAchievement("CgkI_7ufk-EKEAIQCQ");
			} else {
				//game over
				appPaused = true;
				notUsedInv = true;
				noMargin = true;
				coinsThisGame = 0;
				$('#bomb').addClass('disabled');
				$("#menuTitle").html("Game Over");
				$('#endScore').html('Score<span>:</span>'+score).fadeIn(0);
				
				$('#menu').fadeIn(0);
				$('#centerMenu').css({'margin-top' : cHeight*0.5-$('#centerMenu').height()*0.5});
				if (score>localStorage.highscore) {
					localStorage.highscore = score;
					$('#highscore span').html(score);
					if (localStorage.isLogin == 'true') {
						//save score to google
						submitHighscore(localStorage.highscore);
					}
				}
			}
		}
	}
}

function openBrowser(url){
	var iab = cordova.InAppBrowser;
	iab.open(url, '_system');
	return false;
}
document.addEventListener("pause", onPause, false);
function onPause() {
	snd.pause();
	appPaused = true;
}

document.addEventListener("resume", onResume, false);
function onResume() {
	if (!localStorage.sound)
		localStorage.sound = "on";
	if (localStorage.sound == "on")
		snd.play();
	appPaused = false;
	
	then = Date.now();
	loop();
}
function onStatus(status) {
	if( status==Media.MEDIA_STOPPED ) {
			snd.play();
	}
}
