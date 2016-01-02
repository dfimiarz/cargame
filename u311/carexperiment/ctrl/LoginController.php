<?php

namespace u311\carexperiment\ctrl;

include_once __DIR__ . '/../../../vendor/autoload.php';

use u311\carexperiment\ctrl\UserController as UserController;
use u311\carexperiment\component\Router as Router;
use u311\carexperiment\ctrl\SQLUserManager as SQLUserManager;

session_start();

$after_login_dest_code = null;

if( isset($_SESSION['dest']) && !empty($_SESSION['dest'])){
    $after_login_dest_code = $_SESSION['dest'];
}


unset($_SESSION['dest']);
unset($_SESSION['login_err']);
unset($_SESSION['user']);
unset($_SESSION['user_id']);
unset($_SESSION['score']);
unset($_SESSION['show_popup']);

session_regenerate_id();

$ctrl = new LoginController();
$ctrl->setDestCode($after_login_dest_code);
$ctrl->runTask();



class LoginController
{

    private $dest_code = 'default'; 
    private $router;

    public function __construct()
    {
	$this->router = new Router();
    }

    public function setDestCode($code) {
        if(!is_null($code)){
            $this->dest_code = $code;
        }
    }

    public function runTask() {

        $user = filter_input(INPUT_POST,'user');
        $pass = filter_input(INPUT_POST,'pass');
        
        try {

            
            if( ! UserController::processLogin($user,$pass)){
                $this->failure("Login failed");
            }
           
            $usermanager = new SQLUserManager();
            $new_user_id = $usermanager->createUser();
            
            $_SESSION['user_id'] = $new_user_id;

            $this->success();
        } catch (Exception $e) {

            $err_msg = "Operation failed: Error code " . $e->getCode();

            //Code 0 means that this is none-system error.
            //In this case we should be able to display the message text itself.
            if ($e->getCode() == 0) {
                $err_msg = "Operation failed: " . $e->getMessage();
            }

            $this->failure($err_msg);
        }
    }

    private function success() {
        
        header('Location: ' . $this->router->getDestination($this->dest_code));
        
        exit();
    }

    private function failure($error_txt){

        $_SESSION['login_err'] = $error_txt;

        $destination_code = empty($this->dest_code) ? '' : '?src=' . $this->dest_code;

        $url = $this->router->getDestination('login') . $destination_code;

        header('Location: ' . $url);
        
        exit();
    }

}
