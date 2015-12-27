<?php

namespace u311\carexperiment\ctrl;

include_once __DIR__ . '/../../../vendor/autoload.php';

use u311\carexperiment\view\View as View;

session_start();

$session_number = 1;
$show_popup = true;
$game_score=0;

if( isset($_SESSION['session_num']) && is_numeric($_SESSION['session_num'])){
    $session_number = $_SESSION['session_num'];
}

if( isset($_SESSION['show_popup']) && is_numeric($_SESSION['show_popup'])){
    $show_popup = $_SESSION['show_popup'];
}

if( isset($_SESSION['score']) && is_numeric($_SESSION['score'])){
    $game_score = $_SESSION['score'];
}

$survey_url = './survey.php';

$view = new View(__DIR__ . '/../resources/templates/');
$view->loadTemplate('gamestate.js.twig');

$page_cont = array("session_number"=>$session_number,"survey_url"=>$survey_url, "game_score"=>$game_score, "show_popup"=>$show_popup);

echo $view->render($page_cont);