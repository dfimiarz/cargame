<?php

include_once __DIR__ . '/vendor/autoload.php';

use u311\carexperiment\component\Router as Router;
use u311\carexperiment\view\View as View;
use u311\carexperiment\ctrl\SQLUserManager as SQLUserManager;
use u311\carexperiment\model\GameCompInfo as GameCompInfo;

session_start();

$router = new Router();

if (!isset($_SESSION['user_id'])) {
    $url = $router->getDestination('login');
    header('Location: ' . $url . '?src=explain');
    exit();
}

$length = 5;

$characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
$charactersLength = strlen($characters);
$randomString = '';
for ($i = 0; $i < $length; $i++) {
    $randomString .= $characters[rand(0, $charactersLength - 1)];
}

$score = $_SESSION['score'];
$user_id = $_SESSION['user_id'];
$bonus = $score * .05;

$error_msg = "";


$info = new GameCompInfo($user_id,$randomString,$score);

try{
    $user_manager = new SQLUserManager();
    $user_manager->updateCompInfo($info);
        
} catch (\Exception $ex) {

    $error_msg = "ERROR USER:$user_id:SCORE:$score:STRING:$randomString:BONUS:$bonus";
}

$page_cont = array('comp_code'=>$info->comp_code,'score'=>$info->score,'bonus'=>$bonus,'error'=>$error_msg);

session_unset();
session_destroy();

$view = new View(__DIR__ . '/u311/carexperiment/resources/templates/');
$view->loadTemplate('debriefing.twig');

echo $view->render($page_cont);
