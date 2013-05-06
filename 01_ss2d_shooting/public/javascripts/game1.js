$(function(){

var GameImage = { 
    bg:'./images/spaceArt/png/Background/backgroundColor.png',
    starSmall:'./images/spaceArt/png/Background/starSmall.png',
    starBig:'./images/spaceArt/png/Background/starBig.png',
    cloud:'./images/spaceArt/png/Background/nebula.png',
    speedLine:'./images/spaceArt/png/Background/speedLine.png',
    player:'./images/spaceArt/png/player.png',
    enemy:'./images/spaceArt/png/enemyShip.png',
    laser:'./images/spaceArt/png/laserGreen.png',
    enemy_laser:'./images/spaceArt/png/laserRed.png'
}


var GameEnv = {
    W:640,
    H:480
}


var GameConfig = {
    max_enemy:4,
    enemy_size:30,
    player_size:30,
    background_object_count:20
}


var GameStatus = {
    score:0,
    background_object_count:0
}


var GameObj = {
    view:null,
    game:null,
    rightWall:null,
    leftWall:null,
    playerGroup:[],
    enemyGroup:[],
    bgGroup:[]
}


function initGame(){
    createView();
    createLayer();
    createBG();
    createMessage();
    createWall();
    createPlayer();
    createEnemy();
    GameObj.view.startLoop();	
}


function resetGame(){
    GameObj.view.stopLoop();	
    GameStatus.score = 0;
    GameStatus.background_object_count = 0;
    GameObj.game = null; 
    GameObj.view = null; 
    GameObj.playerGroup = [];
    GameObj.enemyGroup = [];
}


function createView(){
    GameObj.view = new ss2d.View('game1');
    GameObj.view.mBackgroundFillStyle = '#555555';
}


function createLayer(){
    GameObj.game = new ss2d.DisplayObjectContainer(0, 0);
    GameObj.view.mMainScene.addObject(GameObj.game);
}


function createBG(){
    var _bg = new ss2d.Sprite(0, -GameEnv.H, GameEnv.W, GameEnv.H*2, GameImage.bg);

    _bg.tick = function(dt){
        if((GameStatus.background_object_count < GameConfig.background_object_count) && Math.ceil( Math.random()* 10) % 10 == 0){
            var _starBig = new ss2d.Sprite(Math.ceil(Math.random() * GameEnv.W), -20 , 15, 15, GameImage.starBig);
            var _starSmall = new ss2d.Sprite(Math.ceil(Math.random() * GameEnv.W), -20 , 10, 10, GameImage.starBig);
            
            _starSmall.tick = function(dt){
                _starSmall.mLocation.mY += 4;
                if (_starSmall.mLocation.mY > GameEnv.H){
                    _starSmall.mLocation.mY = -30;
                }
            }
            
            _starBig.tick = function(dt){
                _starBig.mLocation.mY += 2;
                if (_starBig.mLocation.mY > GameEnv.H){
                    _starBig.mLocation.mY = -30;
                }
            }

            GameObj.view.mMainScene.addObject(_starBig);
            GameObj.view.mMainScene.addObject(_starSmall);
            GameStatus.background_object_count++;
        }

        var _input = ss2d.CURRENT_VIEW.mInput;
        if(_input.isKeyPressed(ss2d.Input.Keys.R)){
            resetGame();
            initGame();
        }
    }
    GameObj.game.addObject(_bg);
}


function createWall(){
    GameObj.rightWall = new ss2d.Quad(GameEnv.W - 5, 0, 10, GameEnv.H, '#555555'); 
    GameObj.game.addObject(GameObj.rightWall);

    GameObj.leftWall = new ss2d.Quad(0, 0, 10, GameEnv.H, '#555555'); 
    GameObj.game.addObject(GameObj.leftWall);
}


function createMessage(){
    var _text = new ss2d.TextSprite(20, 20, 'score:', '#FFFFFF');
    _text.mTotalTime = 0;
    _text.tick = function(dt){
        _text.mTextString = 'score:'+GameStatus.score;
    }
    GameObj.game.addObject(_text);
}


function createPlayer(){
    var _player = new ss2d.Sprite(GameEnv.W*0.5, GameEnv.H*0.8, 30, 30, GameImage.player);
    _player.tick = function(dt){
        var _input = ss2d.CURRENT_VIEW.mInput;
        if(_input.isKeyPressed(ss2d.Input.Keys.A) && !_player.collideWith(GameObj.leftWall)){
            _player.mLocation.mX -= 200 * dt;
        }
        if(_input.isKeyPressed(ss2d.Input.Keys.D) && !_player.collideWith(GameObj.rightWall)){
            _player.mLocation.mX += 200 * dt;
        }
        if(_input.isKeyPressed(ss2d.Input.Keys.W)){	
            _player.mLocation.mY -= 200 * dt;
        }
        if(_input.isKeyPressed(ss2d.Input.Keys.S)){	
            _player.mLocation.mY += 200 * dt;
        }
        if(_input.isKeyPressed(ss2d.Input.Keys.SPACE) && dt * 1000 % 4 == 0){
            emitLaser(_player);
            
        }
    }
    if (GameObj.playerGroup.length == 0){
        GameObj.game.addObject(_player);
        GameObj.playerGroup.push(_player);
    }
}


function removePlayer(i){
    GameObj.game.removeObject(GameObj.playerGroup[i]);
    GameObj.playerGroup.splice(i,1);
}


function createEnemy(){
    var _enemy = new ss2d.Sprite(Math.ceil(Math.random() * 400 + 50), -GameConfig.enemy_size, 
                                 30, 30, 
                                 GameImage.enemy);
    _enemy.mDirection = 1;
    _enemy.tick = function(dt){
        _enemy.mLocation.mX += 100 * dt * _enemy.mDirection;
        _enemy.mLocation.mY += 0.25;
         
        if(_enemy.collideWith(GameObj.leftWall) || _enemy.collideWith(GameObj.rightWall)){ 
           _enemy.mDirection *= -1;
        }
        if(Math.ceil(Math.random()*100)% 40 == 0){
            emitEnemyLaser(_enemy);
        }
        if(_enemy.mLocation.mY > GameEnv.H) {
            GameObj.game.removeObject(_enemy);
        }
        if(GameObj.enemyGroup.length < 5){
            createEnemy();
        }
 
    }
    GameObj.enemyGroup.push(_enemy);
    GameObj.game.addObject(_enemy);
}


function removeEnemy(i){
    GameObj.game.removeObject(GameObj.enemyGroup[i]);
    GameObj.enemyGroup.splice(i,1);
}


function emitLaser(player){
    var _laser = new ss2d.Sprite(player.mLocation.mX + GameConfig.enemy_size / 2, 
                                 player.mLocation.mY, 5, 20, 
                                 GameImage.laser);
    _laser.tick = function(dt){
        _laser.mLocation.mY -= 10;
        for(var i in GameObj.enemyGroup){
            if(_laser && _laser.collideWith(GameObj.enemyGroup[i])){
                GameStatus.score = GameStatus.score + 100;
                GameObj.game.removeObject(_laser);
                removeEnemy(i);
           }
        }
        if(_laser && _laser.mLocation.mY < 0){
            GameObj.game.removeObject(_laser);
        }
    }
    GameObj.game.addObject(_laser);
}


function emitEnemyLaser(enemy){
    var _laser = new ss2d.Sprite(enemy.mLocation.mX + GameConfig.player_size / 2,
                                 enemy.mLocation.mY, 5, 20, 
                                 GameImage.enemy_laser);
    _laser.tick = function(dt){
        _laser.mLocation.mY += 3;
        for(var i in GameObj.playerGroup){
            if(_laser && _laser.collideWith(GameObj.playerGroup[i])){
                GameObj.game.removeObject(_laser);
                removePlayer(i);
            }
            if(_laser && _laser.mLocation.mY > GameEnv.H){
                GameObj.game.removeObject(_laser);
            }
        }
    }
    GameObj.game.addObject(_laser);
}

initGame();

});


