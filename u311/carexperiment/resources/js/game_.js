/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//---Game intro state class---
/*
 * Static implementation of GameState Example
LakeRideGameState = {
  enter: function(game){
      
  },
  exit: function(game){
      
  },
  update: function(game){
      console.log("Update in LakeRide");
  },
  handleInput: function(game){
      
  }
};
*/

GameDetourState = function(game){
    this.game = game;
}

GameDetourState.prototype.update = function(d_t){
    game.objects["road_detour"].tilePosition.y += 1;
};

GameDetourState.prototype.handleInput = function(){
    this.game.setState(new GameIntroState(this.game) );
};

GameDetourState.prototype.enter = function(){
    
    game.objects["car"].x = this.game.pref_width * .7;
    game.objects["car"].y = this.game.pref_height * .75;
    
    this.game.scenes["detour"] = new PIXI.Container();
    this.game.scenes["detour"].interactive = true;
    this.game.scenes["detour"].click = this.handleInput.bind(this);
    
    this.game.scenes["detour"].addChild(game.objects["road_detour"]);
    this.game.scenes["detour"].addChild(game.objects["car"]);
    
    this.game.pixi_stage.addChild(game.scenes["detour"]);
};

GameDetourState.prototype.exit = function(){
    
    this.game.scenes["detour"].removeChild(game.objects["road_detour"]);
   
    this.game.pixi_stage.removeChild(game.scenes["detour"]);
    
    delete this.game.scenes["detour"];
};




GameIntroState = function(game){   
    this.game = game;
    
};

GameIntroState.prototype.update = function(d_t){
    
    this.game.objects["car"].updateObj(d_t);
    this.game.objects["road_main"].tilePosition.y += 1;
    
    
};

GameIntroState.prototype.handleInput = function(){
    this.game.setState(new GamePlayState(this.game) );
};

GameIntroState.prototype.enter = function(){
    
    //get the car object
    var car = this.game.objects["car"];
    
    //set the car to CarState_Intro
    car.setState(new CarState_Intro(this.game,car));
    
    //Set up the intro scene
    this.game.scenes["intro"] = new PIXI.Container();
    this.game.scenes["intro"].interactive = true;
    this.game.scenes["intro"].click = this.handleInput.bind(this);
    
    this.game.scenes["intro"].addChild(game.objects["road_main"]);
    this.game.scenes["intro"].addChild(game.objects["car"]);
    this.game.scenes["intro"].addChild(game.objects["splash_txt"]);
    
    
    
    //Add intro scene to the stage
    this.game.pixi_stage.addChild(game.scenes["intro"]);
};

GameIntroState.prototype.exit = function(){
    
    this.game.scenes["intro"].removeChild(game.objects["road_main"]);
    this.game.scenes["intro"].removeChild(game.objects["car"]);
    this.game.scenes["intro"].removeChild(game.objects["splash_txt"]);
    
    this.game.pixi_stage.removeChild(game.scenes["intro"]);
    
    delete this.game.scenes["intro"];
};

//---Game play state class---
GamePlayState = function(game)
{
    this.game = game;
    this.c_disp_dist = 50;
    this.c_disp_dist_left = this.c_disp_dist;
    this.active_coins = [];
};

GamePlayState.prototype.update = function(d_t)
{
    
    
    this.game.objects["car"].updateObj(d_t);
    this.game.objects["road_main"].updateObj(d_t);
    
    this.game.objects["speed_txt"].text = "Speed: " + Math.round(game.objects["car"].v) + " (m/s)";
    this.game.objects["distance_txt"].text = "Distance: " + Math.round(game.objects["car"].dist_driven) + " (m)";
    
    this.c_disp_dist_left -= game.objects["car"].v * d_t/1000;
    
    
    for( var i = this.active_coins.length - 1; i >= 0; i--){
        var active_coin = this.active_coins[i]; 
        active_coin.updateObj(d_t);
        
        if( active_coin.state instanceof CoinState_OoB ||
            active_coin.state instanceof CoinState_Collected){
            
            
            //console.log("Removing a OoB coin from active coin array\n");
            var coins_to_remove = this.active_coins.splice(i,1);
           
            if( coins_to_remove.length == 1 ){
                var c = coins_to_remove.shift();
                c.setState(new CoinState_NEW(this.game,c));
                this.game.scenes["drive"].removeChild(c);
                this.game.objects["coins"].push(c);
            }
        }
    }
    
    if( this.c_disp_dist_left <= 0 ){
        this.c_disp_dist_left = this.c_disp_dist;
        //Pop a coin from the pool
        var coin = game.objects["coins"].shift();
        coin.setState(new CoinState_SHOWING(this.game,coin));
        this.game.scenes["drive"].addChild(coin);
        this.active_coins.push(coin);    
    }
    

};

GamePlayState.prototype.handleInput = function()
{


};

GamePlayState.prototype.enter = function()
{
    console.log("Game entered play state");
    
    //get the car object
    var car = this.game.objects["car"];
    
    //set the car to CarState_Intro
    car.setState(new CarState_Drive(this.game,car));
    
    //Set up the intro scene
    this.game.scenes["drive"] = new PIXI.Container();
    this.game.scenes["drive"].interactive = true;
    this.game.scenes["drive"].click = this.handleInput.bind(this);
    
    this.game.scenes["drive"].addChild(game.objects["road_main"]);
    this.game.scenes["drive"].addChild(game.objects["car"]);
    
    this.game.scenes["drive"].addChild(game.objects["speed_txt"]);
    game.objects["speed_txt"].position.x = 10;
    game.objects["speed_txt"].position.y = 10;
    
    this.game.scenes["drive"].addChild(game.objects["distance_txt"]);
    game.objects["distance_txt"].position.x = 10;
    game.objects["distance_txt"].position.y = 30;
    
    this.game.scenes["drive"].addChild(game.objects["coins_txt"]);
    game.objects["coins_txt"].position.x = 10;
    game.objects["coins_txt"].position.y = 50;
    
    //Add intro scene to the stage
    this.game.pixi_stage.addChild(game.scenes["drive"]);
    
    this.c_disp_dist_left = this.c_disp_dist;
};

GamePlayState.prototype.exit = function ()
{
    //remove all children from the scene
    this.game.scenes["drive"].removeChildren();
    //remove the scene from stage
    this.game.pixi_stage.removeChild( this.game.scenes["drive"]);
    
    //delete the scene object
    delete this.game.scenes["drive"];
};

GamePausedState = function(game_obj)
{
    this.world = game_obj;
};

GamePausedState.prototype.update = function(){
    
};

GamePausedState.prototype.enter = function(){
    
};

GamePausedState.prototype.exit = function(){
    
};

GamePausedState.prototype.update = function(){
    
};

GamePausedState.prototype.handleInput = function()
{
    
};

Game = function () {
    this.pref_width = 512;
    this.pref_height = 512;
    this.pixi_renderer = PIXI.autoDetectRenderer(this.pref_width, this.pref_height,{backgroundColor : 0x1099bb});
    this.pixi_stage = new PIXI.Container();
    
    
    this.current_state = new GameIntroState(this);
    
    this.inputcomp = InputComponent;
    
    //Main graphics scene object
    this.scenes = {};
    //Container for all objects used by the game
    this.objects = {};   
};

Game.prototype.init = function ()
{
    this.current_state.enter();
};

Game.prototype.setState = function(state)
{
    if( this.current_state !== undefined ){
        this.current_state.exit();
    }
    this.current_state = state;
    this.current_state.enter();
    console.log("New state assigned" + this.current_state.toString());
};

// d_t number of milliseconds passed between frames
Game.prototype.update = function(d_t)
{
    
    //console.log("Time passed (ms): "  + d_t);
    this.current_state.update(d_t);
};

Game.prototype.render = function()
{
   this.pixi_renderer.render(game.pixi_stage);   
};



