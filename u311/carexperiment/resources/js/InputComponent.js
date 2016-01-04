/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

InputComponent = {
    keysStates: {},
    mouseStates: {},
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
    },
    handleMouseDown: function( event )
    {
        var button = event.button;
        this.mouseStates[button] = true;
        
        console.log("Mouse down" + button);
        event.preventDefault();
        event.stopPropagation();
        
    },
    handleMouseUp: function( event )
    {
        var button = event.button;
        this.mouseStates[button] = false;
        
        console.log("Mouse up" + button);
        event.preventDefault();
        event.stopPropagation();
    }
    
    
    
};

