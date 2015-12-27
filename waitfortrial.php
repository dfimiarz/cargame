<?php

include_once __DIR__ . '/vendor/autoload.php';

use u311\carexperiment\view\View as View;
use u311\carexperiment\component\Router as Router;

session_start();

$wait_time_str = "Unknow";

if( isset($_SESSION['trial_start']))
{
    $wait_time = $_SESSION['trial_start'];
    
    $dtF = new \DateTime("@0");
    $dtT = new \DateTime("@$wait_time");
    $wait_time_str =  $dtF->diff($dtT)->format('%a days, %h hours, %i minutes and %s seconds');
}

$page_cont = array("wait_time"=>$wait_time_str);

$view = new View(__DIR__ . '/u311/carexperiment/resources/templates/');
$view->loadTemplate('wait.html.twig');

echo $view->render($page_cont);