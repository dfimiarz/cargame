<?php

namespace u311\carexperiment\ctrl;

include_once __DIR__ . '/../../../vendor/autoload.php';

use u311\carexperiment\view\JSONMessageSender as JSONMessageSender;
use u311\carexperiment\ctrl\GameDataCtrl as GameDataCtrl;

session_start();

/* @var $msg_sender JSONMessageSender. Sends JSON encdoded text to the client*/
$msg_sender = new JSONMessageSender();


if(isset($_POST['popup']))
{
    $popup=$_POST['popup'];
    $_SESSION['show_popup'] = $popup;
    
}

/*
 * No error, Send reponseo with OK message.
 */
$msg_sender->onResult(null, 'OK');



