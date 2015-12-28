<?php

namespace u311\carexperiment\ctrl;

class UserController
{
	//check user password
    public static function processLogin($u1,$u2,$pass) {

        
        $user_info = NULL;
        
        if( len($u1) )

        if(strcmp($u1, $u2) !== 0 ){
            return $user_info;
        }
        
        if(strcmp("pass", $password) == 0 ){
            $user_info = $u1;
        }
        
        return $user_info;
    }
}


