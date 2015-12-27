/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

InputComponent = {
    keysStates: {},
    handleKeyDown: function (event)
    {
        //console.log("key down: " + this.keysStates);
        var key = event.keyCode || event.which;
        this.keysStates[key] = true;
        event.preventDefault();
    },
    handleKeyUp: function (event)
    {
        //console.log("key up");
        var key = event.keyCode || event.which;
        this.keysStates[key] = false;
        event.preventDefault();
    }
};

