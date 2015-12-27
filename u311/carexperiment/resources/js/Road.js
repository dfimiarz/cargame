/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */




Road = function (texture) {

    //Call the superclass 
    PIXI.extras.TilingSprite.call(this,texture,texture.width,texture.height);
    this.x = 0;
    this.y = 0;
    this.r_limit = 0;
    this.l_limit = texture.width;
    //How many pix per meter
    this.m_to_pix = 32;
};

Road.prototype = Object.create(PIXI.extras.TilingSprite.prototype);
Road.prototype.constructor = Road;

Road.prototype.updateObj = function(d_t)
{
    var dist_driven = game.objects["car"].v * d_t/1000;
    this.tilePosition.y += dist_driven * this.m_to_pix;
    
}
