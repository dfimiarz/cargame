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

$length = 5;

$characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
$charactersLength = strlen($characters);
$randomString = '';
for ($i = 0; $i < $length; $i++) {
    $randomString .= $characters[rand(0, $charactersLength - 1)];
}

$page_cont = array('rand_str' => $randomString);

session_unset();
session_destroy();

$view = new View(__DIR__ . '/u311/carexperiment/resources/templates/');
$view->loadTemplate('debriefing.twig');

echo $view->render($page_cont);
