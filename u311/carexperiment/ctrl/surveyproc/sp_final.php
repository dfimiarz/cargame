<?php

namespace u311\carexperiment\ctrl;

include_once __DIR__ . '/../../../../vendor/autoload.php';

use u311\carexperiment\ctrl\GameDataCtrl as GameDataCtrl;
use u311\carexperiment\component\Router as Router;
use u311\carexperiment\model\FormField as FormField;
use u311\carexperiment\model\FormValidator as FormValidator;

session_start();

$router = new Router();

$err_shuttle_rating=false; 
$err_shuttle_rating_text="";

//If $_SESSION['user_id'] not set, user is not logged in. Send back to login page
if( ! isset($_SESSION['user_id']))
{
    $url = $router->getDestination('login');
    header('Location: ' . $url );
    exit();
}

/* @var $user_id Stroes the value of logged in user_id */
$user_id=$_SESSION['user_id'];

/* 
 * $_SESSION['errors'] will hold all errors that need to be passed to the form
 * Starte by unsetting it
 */

unset($_SESSION['f_errs']); // clear all errors...
unset($_SESSION['form_err']); // clear main form error


/*
 * Initialize an array of FormFields
 */
$fields = [];
$fields[] = new FormField('survey_id',null,false);
$fields[] = new FormField('Q1',null,true);
$fields[] = new FormField('Q2',null,true);
$fields[] = new FormField('Q3',null,true);
$fields[] = new FormField('Q4',null,true);
$fields[] = new FormField('Q5',null,true);



//Loop through each field and assisgn values from the $_POST
foreach( $fields as $field )
{
    $fname = $field->getName();
    
    if( isset($_POST[$fname])){
        $field->setValue($_POST[$fname]);
    }
    
}

/* @var $validator FormValidator */
$validator = new FormValidator($fields);

/* @var $errors array of validation errors NAME=>VALUE pairs */
$errors = $validator->validate();

if( !empty($errors))
{
    $_SESSION['form_err'] = "Please correct errors below";
    $_SESSION['f_errs'] = $errors;
    
    $url = $router->getDestination('survey');
    header('Location: ' . $url );
    exit();
}


try {
    
    $data_crl = new GameDataCtrl();
    
    $data_crl->recordSuveyResult($fields, $user_id);
        
} catch (\Exception $ex) {
    
    $_SESSION['form_err'] = "Error writing to the database: " . $ex->getMessage();
    
    $url = $router->getDestination('survey');
    header('Location: ' . $url );
    exit();
    
}

$url = $router->getDestination('debrief');
header('Location: ' . $url );
exit();

//Save the data

