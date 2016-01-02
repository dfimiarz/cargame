<?php

include_once __DIR__ . '/vendor/autoload.php';

use u311\carexperiment\view\View as View;
use u311\carexperiment\component\Router as Router;

session_start(); 

/*
 * Array of files to use for each survey page
 */
$survey_files = array(1=>array("tmpl"=>"survey.twig","proc"=>"./u311/carexperiment/ctrl/surveyproc/sp_1.php"),
                      2=>array("tmpl"=>"survey2.twig","proc"=>"./u311/carexperiment/ctrl/surveyproc/sp_2.php"),
                      3=>array("tmpl"=>"survey3.twig","proc"=>"./u311/carexperiment/ctrl/surveyproc/sp_3.php"),
                      4=>array("tmpl"=>"survey4.twig","proc"=>"./u311/carexperiment/ctrl/surveyproc/sp_4.php"),
                      5=>array("tmpl"=>"survey5.twig","proc"=>"./u311/carexperiment/ctrl/surveyproc/sp_5.php"),
                      6=>array("tmpl"=>"survey6.twig","proc"=>"./u311/carexperiment/ctrl/surveyproc/sp_6.php"),
                      7=>array("tmpl"=>"survey7.twig","proc"=>"./u311/carexperiment/ctrl/surveyproc/sp_7.php"),
                      8=>array("tmpl"=>"survey8.twig","proc"=>"./u311/carexperiment/ctrl/surveyproc/sp_8.php"),
                      9=>array("tmpl"=>"survey9.twig","proc"=>"./u311/carexperiment/ctrl/surveyproc/sp_9.php"),
                      10=>array("tmpl"=>"survey_final.twig","proc"=>"./u311/carexperiment/ctrl/surveyproc/sp_final.php"),
                      'err'=>array("tmpl"=>"surveyerror.twig","proc"=>""));

$router = new Router();

if (!isset($_SESSION['user_id'])) {
    
    $url = $router->getDestination('login');
    header('Location: ' . $url);
    exit();
}

/*
 * Use it to get the right survey form
 * Set the survey display to final survey
 */
$session_number = 10;

//if( isset($_SESSION['survey_id'])){
//    $session_number = $_SESSION['survey_id'];
//}

$errors_array = [];

if (isset( $_SESSION['f_errs'])) {
    
    $errors_array = $_SESSION['f_errs'];
    
}

$form_error = '';

if (isset( $_SESSION['form_err'])) {
    
    $form_error = $_SESSION['form_err'];
    
}

$template_name = "surveyerror.twig";
$form_proc = null;

if (isset($survey_files[$session_number])) {

    $file_config = $survey_files[$session_number];
    if (is_array($file_config)) {
        $template_name = $file_config["tmpl"];
        $form_proc = $file_config["proc"];
    }
}


$view = new View(__DIR__ . '/u311/carexperiment/resources/templates/');
$view->loadTemplate($template_name);

$page_cont = array('logout_url' => $router->getDestination('logout'), 'errors' => $errors_array,'form_error'=>$form_error,'form_proc'=>$form_proc);

echo $view->render($page_cont);