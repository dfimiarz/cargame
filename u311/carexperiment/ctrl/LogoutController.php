<?php

namespace u311\carexperiment\ctrl;

include_once __DIR__ . '/../../../vendor/autoload.php';

use u311\carexperiment\component\Router as Router;

session_start();
session_unset();
session_destroy();

$router = new Router();

$url = $router->getDestination('default');
header('Location: ' . $url);
exit();