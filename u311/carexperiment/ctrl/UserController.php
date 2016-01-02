<?php

namespace u311\carexperiment\ctrl;

use u311\carexperiment\config\Config as Config;

class UserController
{
	//check user password
    public static function processLogin($user,$pass) { 
        
        $authenticated = false;
        
        if(strcmp($user, "player") == 0 && 
                strcmp($pass, "cargame") == 0){
            $authenticated = true;
        }
             
        return $authenticated;
    }
}


