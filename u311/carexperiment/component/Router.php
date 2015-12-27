<?php

namespace u311\carexperiment\component;

class Router {

    private $targets = array();

    public function __construct() {
        /*
         * $host and $root vairable should be set to correct values in order for redirect to work as expected
         */
        $host = $_SERVER['HTTP_HOST'];
        $this->targets['default'] = "http://$host/";
        $this->targets['game'] = "http://$host/game.php";
        $this->targets['explain'] = "http://$host/explain.php";
        $this->targets['login'] = "http://$host/login.php";
        $this->targets['wait'] = "http://$host/waitfortrial.php";
        $this->targets['logout'] = "http://$host/u311/carexperiment/ctrl/LogoutController.php";
        $this->targets['debrief'] = "http://$host/debrief.php";
        $this->targets['survey'] = "http://$host/survey.php";
    }

    public function getDestination($code) {

        if (array_key_exists($code, $this->targets))
            return $this->targets[$code];
        else
            return $this->targets['default'];
    }

}
