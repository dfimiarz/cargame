<?php

namespace u311\carexperiment\ctrl;

class UserController
{

    // Hold an instance of the class
    private static $instance;

    // A private constructor; prevents direct creation of object
    private function __construct()
    {

    }

    // The singleton method
    public static function getController()
    {
        if (!isset(self::$instance)) {
            $c = __CLASS__;
            self::$instance = new $c;
        }

        return self::$instance;
    }

    // Prevent users to clone the instance. Singleton pattern
    public function __clone()
    {
        trigger_error('Clone is not allowed.', E_USER_ERROR);
    }


	//check user password
    public function processLogin($username, $password) {

        //Would be better to replace this with a user class
        
        $user_info = NULL;

        if(strcmp("admin", $username) == 0 && strcmp("test123", $password) == 0 )
        {
            $user_info = new \stdClass();
            $user_info->name = 'admin';
            $user_info->id = 1;
        }
        
        else if(strcmp("car_user1023", $username) == 0 && strcmp("flapyfinch", $password) == 0 )
        {
            $user_info = new \stdClass();
            $user_info->name = 'car_user1023';
            $user_info->id = 2;
        }
        
        else if(strcmp("car_user2024", $username) == 0 && strcmp("flapyfinch", $password) == 0 )
        {
            $user_info = new \stdClass();
            $user_info->name = 'car_user2024';
            $user_info->id = 3;
        }
        
        else if(strcmp("car_user3025", $username) == 0 && strcmp("flapyfinch", $password) == 0 )
        {
            $user_info = new \stdClass(); 
            $user_info->name = 'car_user3025';
            $user_info->id = 4;
        }
        
        else if(strcmp("car_user4026", $username) == 0 && strcmp("flapyfinch", $password) == 0 )
        {
            $user_info = new \stdClass();
            $user_info->name = 'car_user3025';
            $user_info->id = 5;
        }
        else if(strcmp("car_user5027", $username) == 0 && strcmp("flapyfinch", $password) == 0 )
        {
            $user_info = new \stdClass();
            $user_info->name = 'car_user3025';
            $user_info->id = 6;
        }
        else if(strcmp("Shuttle_Game1", $username) == 0 && strcmp("flappyfinch", $password) == 0 )
        {
            $user_info = new \stdClass();
            $user_info->name = 'Shuttle_Game1';
            $user_info->id = 8;
        }
        
        return $user_info;
    }

    protected function throwDBExceptionOnError($errmsg, $errno) {

        throw new Exception($errmsg, $errno);
    }

    protected function throwCustomExceptionOnError($errmsg, $errno = 0) {

        throw new Exception($errmsg, $errno);
    }

}


