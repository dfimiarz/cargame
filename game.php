<?php

include_once __DIR__ . '/vendor/autoload.php';

use u311\carexperiment\view\View as View;
use u311\carexperiment\component\Router as Router;

session_start();

$router = new Router();

if (!isset($_SESSION['user_id'])) {
    
    $url = $router->getDestination('login');
    header('Location: ' . $url . '?src=game');
    exit();
}

$session_number = 1;

if( isset($_SESSION['session_num'])){
    $session_number = $_SESSION['session_num'];
}
else {
    $_SESSION['session_num'] = $session_number;
}

$view = new View(__DIR__ . '/u311/carexperiment/resources/templates/');
$view->loadTemplate('game.twig');

$page_cont = array("session_number"=>$session_number);

echo $view->render($page_cont);