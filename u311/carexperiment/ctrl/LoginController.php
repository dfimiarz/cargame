<?php

namespace u311\carexperiment\ctrl;

include_once __DIR__ . '/../../../vendor/autoload.php';

use u311\carexperiment\ctrl\UserController as UserController;
use u311\carexperiment\component\Router as Router;
use u311\carexperiment\ctrl\SQLUserManager as SQLUserManager;

session_start();

unset($_SESSION['login_err']);
unset($_SESSION['user']);
unset($_SESSION['user_id']);
unset($_SESSION['score']);
unset($_SESSION['show_popup']);

session_regenerate_id();

$ctrl = new LoginController();

$dest_code = '';

if( isset($_SESSION['dest']) &&!empty($_SESSION['dest']) ){
    $ctrl->setDestCode($_SESSION['dest']);
}

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
        $this->dest_code = $code;
    }

    public function runTask() {

        $u1 = $u2 = "";
        $pass = "";

        $u1 = trim(isset($_POST["u1"])? $_POST["u1"]:"");
        $u2 = trim(isset($_POST["u2"])? $_POST["u2"]:"");
        $pass = trim(isset($_POST["pass"])? $_POST["pass"]:"");
        
        
        try {

            $user_info = UserController::processLogin($u1,$u2,$pass);
            
            
            if (is_null($user_info)) {
                $this->failure("Login failed");
            }
           
            $new_user_id = SQLUserManager::createUser();
            
            $_SESSION['user'] = $user_info->name;
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
