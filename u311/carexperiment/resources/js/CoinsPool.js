function CoinsPool(texture) {  
  this.texture = texture;
  this.createCoins();
}

CoinsPool.prototype.borrowCoin = function() {
  return this.coins.shift();
};
	
CoinsPool.prototype.returnCoin = function(coin) {
  this.coins.push(coin);
};

CoinsPool.prototype.createCoins = function() {
  this.coins = [];

  this.addCoins(20);
 
};

CoinsPool.prototype.addCoins = function(amount) {
  for (var i = 0; i < amount; i++)
  {
    var coin = new Coin(this.texture);
    this.coins.push(coin);
  }
};


