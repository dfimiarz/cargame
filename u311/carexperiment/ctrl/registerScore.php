<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace u311\carexperiment\ctrl;

include_once __DIR__ . '/../../../vendor/autoload.php';


use u311\carexperiment\view\JSONMessageSender as JSONMessageSender;
use u311\carexperiment\ctrl\GameDataCtrl as GameDataCtrl;

session_start();

/* @var $msg_sender JSONMessageSender. Sends JSON encdoded text to the client*/
$msg_sender = new JSONMessageSender();


/**
 * Expected POST values
 * action=1&state=1
 */

$action = null;
$state = null;
$user_id = null;

if( !isset($_SESSION['user_id'])){
    $msg_sender->onError(null, "User not logged in.");
}

$user_id = $_SESSION['user_id'];

//Check the $_POST['action']
if (isset($_POST['score']) && !empty($_POST['score'])) {
    $score = $_POST['score'];
} else {
    $msg_sender->onError(null, "Action missing");
}


$_SESSION['score']=$score; 

/*
 * No error, Send reponseo with OK message.
 */
$msg_sender->onResult(null, 'OK');



