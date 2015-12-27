CoinState = function(world,coin){
    this.world = world;
    this.coin = coin;
};

CoinState.prototype.update = function(d_t)
{
    
};

CoinState.prototype.enter = function()
{
    
};

CoinState.prototype.exit = function()
{
    
};

CoinState.prototype.handleInput = function()
{
    
};


//===Coin is now collected
CoinState_Collected = function(game,coin){
    CoinState.call(this,game,coin);
}

CoinState_Collected.prototype = Object.create(CoinState.prototype);
CoinState_Collected.prototype.constructor = CoinState_Collected;

CoinState_Collected.prototype.enter = function(){
    console.log("Coin in COLLECTED state");
    this.coin.visible = false;
}
//===

//===Coin is out of bounds
CoinState_OoB = function(game,coin){
    CoinState.call(this,game,coin);
}

CoinState_OoB.prototype = Object.create(CoinState.prototype);
CoinState_OoB.prototype.constructor = CoinState_OoB;

CoinState_OoB.prototype.enter = function(){
    console.log("Coin in OUT OF BOUNDS state");
    this.coin.visible = false;
}
//===

//===Coin is out of bounds
CoinState_NEW = function(game,coin){
    CoinState.call(this,game,coin);
}

CoinState_NEW.prototype = Object.create(CoinState.prototype);
CoinState_NEW.prototype.constructor = CoinState_NEW;

CoinState_NEW.prototype.enter = function(){
    console.log("Coin in NEW state");
    this.coin.animationSpeed = .4;
    this.coin.scale.x = this.coin.scale.y = 1.5;
    this.coin.visible = false;
    
}
//===

CoinState_SHOWING = function(game,coin)
{
    CoinState.call(this,game,coin);
}

CoinState_SHOWING.prototype = Object.create(CoinState.prototype);
CoinState_SHOWING.prototype.constructor = CoinState_SHOWING;


CoinState_SHOWING.prototype.update = function (d_t)
{
    this.coin.y += this.world.objects["car"].v * d_t/1000 * this.world.objects["road_main"].m_to_pix;
    
    var car = this.world.objects["car"];
    var car_r = car.x - car.width/2;
    var car_t = car.y - car.height/2;
    
    
    
    var coin_r = this.coin.x - this.coin.width/2;
    var coin_t = this.coin.y - this.coin.height/2;
    
    
    if (coin_r < car_r + car.width &&
            coin_r + this.coin.width > car_r &&
            coin_t < car_t + car.height &&
            this.coin.height + coin_t > car_t) {
        //console.log("Coin colided");
        this.coin.setState(new CoinState_Collected(this.world,this.coin));
    }

    
    var road_h = this.world.objects["road_main"].height;
    
    if( this.coin.y > road_h)
    {
        //console.log('Coin ready for removal');
        this.coin.setState(new CoinState_OoB(this.world,this.coin));
    }
}

CoinState_SHOWING.prototype.enter = function()
{
    console.log("Coin in SHOWING state");
    this.coin.visible = true;
    this.coin.play();
    var road_r = this.world.objects["road_main"].r_limit;
    var road_l = this.world.objects["road_main"].l_limit;
    
    var road_w = road_r - road_l;
    //Coin pivot is set to .5 which means x,y position referes to the center 
    //of each coin
    var x_pos = road_l + this.coin.width/2 + (Math.random() * (road_w - this.coin.width/2));
    
    this.coin.x = x_pos;
    this.coin.y = -10;
};

CoinState_SHOWING.prototype.exit = function()
{
    this.coin.stop();   
};


Coin = function (textures) {

    //Call the "superclass/ll" 
    PIXI.extras.MovieClip.call(this,textures);
    this.anchor.set(0.5);
    this.state = null;
    
};

Coin.prototype = Object.create(PIXI.extras.MovieClip.prototype);
Coin.prototype.constructor = Coin;

Coin.prototype.updateObj = function(d_t){
    
    this.state.handleInput();
    this.state.update(d_t);
    
};

Coin.prototype.setState = function(state)
{
    console.log("\tCoin changing  state");
    
    if( this.state !== undefined && this.state !== null)
    {
        this.state.exit();
        this.state = null;
    }
    
    this.state = state;
    this.state.enter();
    
};




