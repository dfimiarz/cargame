<?php

include_once __DIR__ . '/vendor/autoload.php';

use u311\carexperiment\view\View as View;

$view = new View(__DIR__ . '/u311/carexperiment/resources/templates/');
$view->loadTemplate('index.html.twig');

$arr_variables = array();

echo $view->render($arr_variables);
