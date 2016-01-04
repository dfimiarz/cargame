

// Global variables for state transitions
var request_feeback=0;
//var frame=0;
var score=10;
var game_count_down=600; // ten minutes to play

//-------------------------------------------------------------------------------------------------------

//  The detour state class:

GameDetourState = function(game){
    this.game = game;
    //frame=0;
};

GameDetourState.prototype.update = function(d_t){
    if(game.objects["car"].v > 7) game.objects["car"].v=7;
    if(game.objects["car"].x > this.game.pref_width*0.8)game.objects["car"].x = this.game.pref_width * .8;
    if(game.objects["car"].x < this.game.pref_width*0.6)game.objects["car"].x = this.game.pref_width * .6;
    this.game.objects["car"].updateObj(d_t);
    this.game.objects["road_detour"].updateObj(d_t);

    this.game.objects["speed_txt"].text = "Speed (limit 7m/s): " + Math.round(game.objects["car"].v) + " (m/s)";
    this.game.objects["distance_txt"].text = "Timer: " + game_count_down;//Math.round(game.objects["car"].dist_driven) + " (m)";
    this.game.objects["coins_txt"].text = "Coins: " + score;
    this.c_disp_dist_left -= game.objects["car"].v * d_t/1000;
   // game.objects["road_detour"].tilePosition.y += 1;
    //frame++;
    if(game.objects["car"].dist_driven>150){//frame>500){
       game.objects["car"].dist_driven=0;
       game.objects["car"].v=0; this.game.setState(new GamePlayState(this.game) ); 
    }
};

GameDetourState.prototype.handleInput = function(){
    //this.game.setState(new GameIntroState(this.game) );
};

GameDetourState.prototype.enter = function(){
    
    game.objects["car"].x = this.game.pref_width * .7;
    game.objects["car"].y = this.game.pref_height * .75;
    var car = this.game.objects["car"];
    car.setState(new CarState_Drive(this.game,car));
    this.game.scenes["detour"] = new PIXI.Container();
    this.game.scenes["detour"].interactive = true;
    this.game.scenes["detour"].click = this.handleInput.bind(this);
    this.game.scenes["detour"].addChild(game.objects["road_detour"]);
    this.game.scenes["detour"].addChild(game.objects["car"]);   

    this.game.scenes["detour"].addChild(game.objects["speed_txt"]);
    game.objects["speed_txt"].position.x = 10;
    game.objects["speed_txt"].position.y = 10;
    
    this.game.scenes["detour"].addChild(game.objects["distance_txt"]);
    game.objects["distance_txt"].position.x = 10;
    game.objects["distance_txt"].position.y = 30;
    
    this.game.scenes["detour"].addChild(game.objects["coins_txt"]);
    game.objects["coins_txt"].position.x = 10;
    game.objects["coins_txt"].position.y = 50;

    this.game.pixi_stage.addChild(game.scenes["detour"]);
};

GameDetourState.prototype.exit = function(){
    
    this.game.scenes["detour"].removeChild(game.objects["road_detour"]);
   
    this.game.pixi_stage.removeChild(game.scenes["detour"]);
    
    delete this.game.scenes["detour"];
};

//------------------------------------------------------------------------------------------------------


//  Intro state class:

GameIntroState = function(game){   
    this.game = game;
    
};

GameIntroState.prototype.update = function(d_t){
    
    this.game.objects["car"].updateObj(d_t);
    this.game.objects["road_main"].tilePosition.y += 1;
    
    
};

GameIntroState.prototype.handleInput = function(){
    
    if (this.game.inputcomp.keysStates[38] || this.game.inputcomp.keysStates[32]) {
        this.game.setState(new GamePlayState(this.game) );
    }
    
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
    
  
    this.game.timer.start();
      
};

GameIntroState.prototype.exit = function(){
    
    this.game.scenes["intro"].removeChild(game.objects["road_main"]);
    this.game.scenes["intro"].removeChild(game.objects["car"]);
    this.game.scenes["intro"].removeChild(game.objects["splash_txt"]);
    
    this.game.pixi_stage.removeChild(game.scenes["intro"]);
    
    delete this.game.scenes["intro"];
};

//------------------------------------------------------------------------------------------------------




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
    if(game.objects["car"].dist_driven>400){
        game.objects["car"].dist_driven=0;
        this.game.setState(new GameDecisionState(this.game));
    }
    
    this.game.objects["car"].updateObj(d_t);
    this.game.objects["road_main"].updateObj(d_t);
    
    this.game.objects["speed_txt"].text = "Speed: " + Math.round(game.objects["car"].v) + " (m/s)";
    this.game.objects["distance_txt"].text = "Timer: " + game_count_down;//Math.round(game.objects["car"].dist_driven) + " (m)";
    this.game.objects["coins_txt"].text = "Coins: " + score;
    this.c_disp_dist_left -= game.objects["car"].v * d_t/1000;
    
    
    for( var i = this.active_coins.length - 1; i >= 0; i--){
        var active_coin = this.active_coins[i]; 
        active_coin.updateObj(d_t);
        
        if( active_coin.state instanceof CoinState_OoB ||
            active_coin.state instanceof CoinState_Collected){
            
            if(active_coin.state instanceof CoinState_Collected){
                score++;
                Report_user_action(1000, 1);// report coin collection
            }
                
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
   // console.log("Game entered play state");
    
    //get the car object
    var car = this.game.objects["car"];
    
    //set the car to CarState_Intro
    car.setState(new CarState_Drive(this.game,car));
    
    //Set up the intro scene
    this.game.scenes["drive"] = new PIXI.Container();
    
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



//-------------------------------------------------------------------------------------------------------
GamePausedState = function(game_obj)
{
    this.world = game_obj;
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




//   Decision state class:

//---Game play state class---
GameDecisionState = function(game)
{
    this.game = game;
   // this.c_disp_dist = 50; // initial distance is 50 menter, display a new one every 50 meters
   // this.c_disp_dist_left = this.c_disp_dist;
   // this.active_coins = [];
};


GameDecisionState.prototype.update = function(d_t)
{
    this.game.objects["car"].updateObj(d_t);
    this.game.objects["road_decision"].updateObj(d_t);
    
    this.game.objects["speed_txt"].text = "Speed: " + Math.round(game.objects["car"].v) + " (m/s)";
    this.game.objects["distance_txt"].text = "Timer:" + game_count_down;//Math.round(game.objects["car"].dist_driven) + " (m)";
    //this.game.objects["coins_txt"].text = "Coins: " + score; // Ofer addition
    if(game.objects["car"].dist_driven>30 && (game.objects["car"].x>300 || game.objects["car"].x<200)){
        game.objects["car"].dist_driven=0;
        if(game.objects["car"].x>256) {
           // frame=0;
            Report_user_action(2000, 1);
            this.game.setState(new GameDetourState(this.game) );
        }
        else{
           // frame=0;
            Report_user_action(3000, 1);
            this.game.setState(new GameShuttleState(this.game) );
        }
    }
};


GameDecisionState.prototype.handleInput = function()
{


};


GameDecisionState.prototype.enter = function()
{
 //   console.log("Game entered decision state");
    
    //get the car object
    var car = this.game.objects["car"];
    
    //set the car to CarState_Intro
    car.setState(new CarState_Drive(this.game,car));

    game.objects["dashboard"].x = 0;//this.game.pref_width / 2;//.7;
    game.objects["dashboard"].y = 0;//this.game.pref_height * .5;//084;
    
    //Set up the intro scene
    this.game.scenes["drive"] = new PIXI.Container();
    
    this.game.scenes["drive"].addChild(game.objects["road_decision"]);
    this.game.scenes["drive"].addChild(game.objects["car"]);
    
    this.game.scenes["drive"].addChild(game.objects["speed_txt"]);
    game.objects["speed_txt"].position.x = 10;
    game.objects["speed_txt"].position.y = 120;
    
    this.game.scenes["drive"].addChild(game.objects["distance_txt"]);
    game.objects["distance_txt"].position.x = 10;
    game.objects["distance_txt"].position.y = 140;
    
    this.game.scenes["drive"].addChild(game.objects["coins_txt"]);
    game.objects["coins_txt"].position.x = 10;
    game.objects["coins_txt"].position.y = 160;

    
    
    //Add intro scene to the stage
    this.game.pixi_stage.addChild(game.scenes["drive"]);
    this.game.scenes["drive"].addChild(game.objects["dashboard"]);
    //this.game.pixi_stage.addChild(game.scenes["dashboard"]);
    
    this.c_disp_dist_left = this.c_disp_dist;
};

GameDecisionState.prototype.exit = function ()
{
    //remove all children from the scene
    this.game.scenes["drive"].removeChildren();
    //remove the scene from stage
    this.game.pixi_stage.removeChild( this.game.scenes["drive"]);
    
    //delete the scene object
    delete this.game.scenes["drive"];
};

//---------------------------------------------------------------------------------------------------------

//  Shuttle state class:

GameShuttleState = function(game){
    this.game = game;
    var speed=0;
    var shuttleride_state; // 0 wait, 1 travel, 2 unload
    var frame;
    var ride_ended; // indicator that ride ended prcedure shoud be done (once only)
    var feedback_choise; // allow choosing between sending feedback or not
}


GameShuttleState.prototype.update = function(d_t){
    frame++;
    if(shuttleride_state===0){
        speed=0;
        this.game.objects["speed_txt"].text = "Shuttle will arrive soon";// + 0 + " (m/s)";
        this.game.objects["distance_txt"].text = "Timer: " +game_count_down;// 0 + " (m)";
        this.game.objects["coins_txt"].text = "Coins: " + score;
        if(frame>300){
            frame=0; // reset the counter
            game.objects["car_shuttle"].visible=true;
            game.objects["shuttle_wait"].visible=false;
            shuttleride_state=1; // travel time 
        }
    } // waiting time


    if(shuttleride_state===1){ // time to ride!
        this.game.objects["speed_txt"].text = "Shuttle speed: " + speed + " (m/s)";
        this.game.objects["distance_txt"].text = "Timer: " + game_count_down;//frame + " (m)";
        this.game.objects["coins_txt"].text = "Coins: " + score;
        if(frame<120) { //shuttle is arriving
            speed=0;
            game.objects["car_shuttle"].y = this.game.pref_height * frame / 150; //075
            //game.objects["car"].y = this.game.pref_height * .1;
        }
        else if(frame<200){speed=0.1; game.objects["dock"].visible=false;}
        else if(frame<500) speed=(frame-199)*3;// accellerate
        else if(frame<750)speed=(750-frame); // decelerate
        else {
            frame=0; // reset the counter
            shuttleride_state=2; // unloading time 
            game.objects["shuttle_unload"].visible=true;
        }
    }


    if(shuttleride_state===2){ // unloading
        game.objects["arrival_dock"].visible=true;
        this.game.objects["speed_txt"].text = "Shuttle speed: " + speed + " (m/s)";
        this.game.objects["distance_txt"].text = "Timer: " + game_count_down;//0 + " (m)";
        this.game.objects["coins_txt"].text = "Coins: " + score;

        if(frame<300) { 
            game.objects["arrival_dock"].y++;
            speed=1; // unloading
            game.objects["car_shuttle"].y+=0.3;

        }
        else {
                speed=0;               
                if(ride_ended) { // do this only once
                    feedback_choise=true;
                    game.objects["shuttle_unload"].visible=false;
                    game.objects["feedback_decision"].visible=true;
                    ride_ended=false; 
                }
        }

    }    
    game.objects["road_shuttle"].tilePosition.y +=Math.sqrt(speed);// Math.log(frame);
};





GameShuttleState.prototype.handleInput = function(){
   // this.game.setState(new GameIntroState(this.game) );
    //console.log("Input in shuttle");
    if(feedback_choise){
     
        if (this.game.inputcomp.keysStates[39]) {
           feedback_choise=false;// do this only once 
           game.objects["feedback_decision"].visible=false;
           game.objects["car"].dist_driven=0;
           showDialog();
        }

        if (this.game.inputcomp.keysStates[37]) {
            feedback_choise=false;// do this only once
            game.objects["feedback_decision"].visible=false;
            game.objects["car"].dist_driven=0;
            game.objects["car"].v=15;
            this.game.setState(new GamePlayState(this.game) );
        }
        
    }
};



GameShuttleState.prototype.enter = function(){

    //console.log("Entered shuttle state");
    score--; // charge toll
    game.objects["car_shuttle"].visible=false;
    game.objects["car_shuttle"].x = this.game.pref_width * .7;
    game.objects["car_shuttle"].y = this.game.pref_height * .01;
    game.objects["car"].x = this.game.pref_width * .7;
    game.objects["car"].y = this.game.pref_height * .75;

    game.objects["shuttle_wait"].x = this.game.pref_width / 3;//.7;
    game.objects["shuttle_wait"].y = 0;// this.game.pref_height * .084;
    game.objects["shuttle_wait"].visible=true;

    game.objects["shuttle_unload"].x = this.game.pref_width / 3;//.7;
    game.objects["shuttle_unload"].y =0;// this.game.pref_height * .084;
    game.objects["shuttle_unload"].visible=false;
    
    
    game.objects["feedback_decision"].x = 0;
    game.objects["feedback_decision"].y =0;
    game.objects["feedback_decision"].visible=false;
    
    game.objects["dock"].x = 0;
    game.objects["dock"].y =this.game.pref_height * .6;
    game.objects["dock"].visible=true;
    
    game.objects["arrival_dock"].x = 0;
    game.objects["arrival_dock"].y =-this.game.pref_height*0.7;
    game.objects["arrival_dock"].visible=false;
    
    this.game.scenes["shuttle"] = new PIXI.Container(); 
    this.game.scenes["shuttle"].addChild(game.objects["road_shuttle"]);
    this.game.scenes["shuttle"].addChild(game.objects["arrival_dock"]);
    this.game.scenes["shuttle"].addChild(game.objects["dock"]);
    this.game.scenes["shuttle"].addChild(game.objects["car_shuttle"]);
    this.game.scenes["shuttle"].addChild(game.objects["car"]);
    this.game.scenes["shuttle"].addChild(game.objects["shuttle_wait"]);
    this.game.scenes["shuttle"].addChild(game.objects["shuttle_unload"]);
    this.game.scenes["shuttle"].addChild(game.objects["feedback_decision"]);
    
    

    this.game.scenes["shuttle"].addChild(game.objects["speed_txt"]);
    game.objects["speed_txt"].position.x = 10;
    game.objects["speed_txt"].position.y = 120;
    
    this.game.scenes["shuttle"].addChild(game.objects["distance_txt"]);
    game.objects["distance_txt"].position.x = 10;
    game.objects["distance_txt"].position.y = 140;
    
    this.game.scenes["shuttle"].addChild(game.objects["coins_txt"]);
    game.objects["coins_txt"].position.x = 10;
    game.objects["coins_txt"].position.y = 160;
    
    this.game.pixi_stage.addChild(game.scenes["shuttle"]);
    ride_ended=true; // allow processing state transition back to play only once
    feedback_choise=false;
    frame=0; // this will time the stages in shuttle ride
    speed=0;
    shuttleride_state=0;
    //request_feeback=true; // ask user to send feedback in the dned of the ride
};

GameShuttleState.prototype.exit = function(){
    
    this.game.scenes["shuttle"].removeChild(game.objects["road_shuttle"]);
   
    this.game.pixi_stage.removeChild(game.scenes["shuttle"]);
    
    delete this.game.scenes["shuttle"];
};




//-------------------------------------------------------------------------------------------------------

//  The Game class:

Game = function () {
    
    this.score = 2;
    
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
    
    this.timer = new CountDownTimer(6,1000,this);
    this.timer.onTick(this.tick);
    
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
   // console.log("New state assigned" + this.current_state.toString());
};

// d_t number of milliseconds passed between frames
Game.prototype.update = function(d_t)
{
    
    //console.log("Time passed (ms): "  + d_t);
    this.current_state.handleInput();
    this.current_state.update(d_t);
};

Game.prototype.render = function()
{
   this.pixi_renderer.render(game.pixi_stage);   
};

Game.prototype.tick = function (){
    //This function will run in CountDownTimer context
    //this refers to the timer class, NOT the game class
    if (this.expired()) {
        alert("Time is up" + this.game.score);
        //reportScore(score);
    }
}

// template for creating several sprites from one texture

function tmp()
{
    for(var i=0; i<10; i++) {
      var s = new PIXI.Sprite(texture);
      s.position.x = Math.random() * renderer.width;
      s.position.y = Math.random() * renderer.height;
      stage.addChild(s);
    }
}




