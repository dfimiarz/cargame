<?php

include_once __DIR__ . '/vendor/autoload.php';

use u311\carexperiment\component\Router as Router;
use u311\carexperiment\view\View as View;

session_start();

$router = new Router();

if (!isset($_SESSION['user_id'])) {
    $url = $router->getDestination('login');
    header('Location: ' . $url . '?src=explain');
    exit();
}

$page_cont = array('logout_url' => $router->getDestination('logout') ,'game_url' => $router->getDestination('game'));

$view = new View(__DIR__ . '/u311/carexperiment/resources/templates/');
$view->loadTemplate('instructions.twig');

echo $view->render($page_cont);