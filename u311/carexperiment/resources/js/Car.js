/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


//Car state in driving part of the game

CarState_Drive = function(world,car){
    this.world = world;
    this.car = car;
}

CarState_Drive.prototype.update = function (d_t)
{
    //--- Update car speed
    if( this.car.gas_pedal_pos === 1 ){
        this.car.incEngPow(d_t);
    }
    else{
        this.car.decEngPow(d_t);
    }
    
    if( this.car.brake_pos === 1 ){
        this.car.incBrakePow(d_t);
    }
    else{
        this.car.decBrakePow(d_t);
    }
   
    
    
    this.car.dist_driven += this.car.v * d_t/1000;
    
    var force = this.car.getForce();
    var a = force / this.car.mass_kg;
    this.car.v = this.car.v + d_t/1000 * a;
    
    if( this.car.v < 0.1 ){
        this.car.v =  0;
    }
    
    
    //--- Update car position
    var car_w = this.car.width /2;
    var right_lim = this.world.objects["road_main"].r_limit - car_w;
    var left_lim = this.world.objects["road_main"].l_limit + car_w;
        
    this.car.x += this.car.steering_pos;
     
    if( this.car.x < left_lim ){
        this.car.x = left_lim;
    }
    
    if( this.car.x > right_lim ){
        this.car.x = right_lim;
    }
    
   
}

CarState_Drive.prototype.enter = function()
{
    console.log("\tCAR entered DRIVE state");
    this.car.x = this.world.pref_width * .5;
    this.car.y = this.world.pref_height * .75;
};

CarState_Drive.prototype.exit = function()
{
    
};

CarState_Drive.prototype.handleInput = function ()
{

     this.car.steering_pos = 0;
     this.car.gas_pedal_pos = 0;
     this.car.brake_pos = 0;

    if (this.world.inputcomp.keysStates[37]) {
        this.car.steering_pos -= 2;
    }

    if (this.world.inputcomp.keysStates[39]) {
        this.car.steering_pos += 2;
    }
    
    if (this.world.inputcomp.keysStates[38]) {
        this.car.gas_pedal_pos = 1;
    }
    
    if (this.world.inputcomp.keysStates[40]) {
        this.car.brake_pos = 1;
    }
    
};

//-------------------


//Car state in game intro

CarState_Intro = function(world,car)
{
    this.world = world;
    this.car = car;
    this.turn_dir = -1;
}

CarState_Intro.prototype.update = function (d_t)
{
    var car_w = this.car.width /2;
    var right_lim = this.world.objects["road_main"].r_limit - car_w;
    var left_lim = this.world.objects["road_main"].l_limit + car_w;
    
    if (this.car.x <= left_lim || this.car.x >= right_lim) {
        this.turn_dir *= -1;
    }
    
    this.car.steering_pos = this.turn_dir * 2;
    
    this.car.x += this.car.steering_pos;
    
    if( this.car.x < left_lim ){
        this.car.x = left_lim;
    }
    
    if( this.car.x > right_lim ){
        this.car.x = right_lim;
    }
    
    console.log("Turn " + this.car.steering_pos);
}

CarState_Intro.prototype.enter = function()
{
    console.log("\tCAR entered INTRO state");
    this.car.x = this.world.pref_width * .5;
    this.car.y = this.world.pref_height * .75;
    this.car.steering_pos = 0;
};

CarState_Intro.prototype.exit = function()
{
    
};

CarState_Intro.prototype.handleInput = function ()
{
     this.car.steering_pos = 0;
};

//---


Car = function (texture) {

    //Call the superclass 
    PIXI.Sprite.call(this,texture,texture.width,texture.height);
    this.anchor.set(0.5);
   
    this.state = null;
    
    //Overall distance driven in meters
    this.dist_driven = 0;
        
    this.mass_kg = 3000;
    //Meteres/sec
    this.v = 0;
    
    //0.5 * Cd (coefficient of friction - from wind tunnel) * A (frontal area 5 sq m) * rho ( air density 1.29)
    this.Cdrag = 5;
    //(aprox) 30 * Cdrag
    this.Crr = 600;
    
    this.eng_pow = 0;
    this.eng_pow_step = 25000; //per second
    this.max_eng_pow = 30000;
    
    this.brake_max_pow = 35000;
    this.brake_pow = 0;
    
    this.steering_pos = 0;
    this.gas_pedal_pos = 0;
    this.brake_pos = 0;
};



Car.prototype = Object.create(PIXI.Sprite.prototype);
Car.prototype.constructor = Car;

Car.prototype.setState = function(state)
{
    console.log("\tCAR changing  state");
    
    if( this.state !== undefined && this.state !== null)
    {
        this.state.exit();
    }
    
    this.state = state;
    this.state.enter();
    
};
Car.prototype.getForce = function ()
{

    //Get engine force
    var e_force = this.eng_pow;
    
    var b_force = this.brake_pow;
    
    if( this.v <= 0 ){
        b_force = 0;
    }
    
    var t_force = e_force - b_force;
    
    //Ftraction + Fdrag + Frr
    var total_force = t_force + (-this.Cdrag * this.v * this.v) + (-(this.Crr) * this.v);    
    
    if (Math.abs(total_force) < 1)
    {
        return 0;
    }

    return total_force;
};
Car.prototype.updateObj = function (d_t)
{
    this.state.handleInput();
    this.state.update(d_t);

};
Car.prototype.incEngPow = function (d_t_ms)
{
    this.eng_pow += this.eng_pow_step * d_t_ms/1000;
    if (this.eng_pow >= this.max_eng_pow) {
        this.eng_pow = this.max_eng_pow;
    }
};
Car.prototype.decEngPow = function (d_t_ms)
{
    //Drop the power by max/3 * d_time
    this.eng_pow -= this.eng_pow_step * 2 * d_t_ms/1000;
    if (this.eng_pow <= 0) {
        this.eng_pow = 0;
    }

};
Car.prototype.incBrakePow = function (d_t_ms)
{
    this.brake_pow += this.brake_max_pow * d_t_ms/200;
    if (this.brake_pow > this.brake_max_pow) {
        this.brake_pow = this.brake_max_pow;
    }
};

Car.prototype.decBrakePow = function (d_t_ms)
{
    this.brake_pow -= this.brake_max_pow * d_t_ms/200;
    if (this.brake_pow <= 0 ) {
        this.brake_pow = 0;
    }
};



