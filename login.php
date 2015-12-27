<?php

include_once __DIR__ . '/vendor/autoload.php';

use u311\carexperiment\view\View as View;
use u311\carexperiment\component\TrialManager as TrialManager;
use u311\carexperiment\component\Router as Router;

session_start();

unset($_SESSION['trial_start']);

$error_txt = '';

/*
 * Get difference from now to start and end.
 */
$diff = TrialManager::getNextTrialTime();

/*
 * If the nearest start is in the future. Redirect to the wait page
 */
if( $diff->start > 0 )
{
    $_SESSION['trial_start'] = $diff->start;
    $router = new Router();
    header('Location: ' . $router->getDestination('wait'));    
    exit();
}

/*
 * If the end difference is negative. There is no trial to do atm
 */
if( $diff->end < 0 )
{
    echo "There are no pending trials.";
    exit();
}

/*
 * Otherwise, display the login page.
 */
if (isset($_SESSION['login_err'])) {
    if (!empty($_SESSION['login_err'])) {
        $error_txt = $_SESSION['login_err'];
        unset($_SESSION['login_err']);
    }
}

//See if the $_GET['src'] is set. If so, pass it to log in controller for redirect.
unset($_SESSION['dest']);

if (isset($_GET['src']) && !empty($_GET['src'])) {
    $_SESSION['dest'] = $_GET['src'];
}

$view = new View(__DIR__ . '/u311/carexperiment/resources/templates/');
$view->loadTemplate('logintemplate.html.twig');

$page_cont = array("login_err"=>$error_txt);

echo $view->render($page_cont);

