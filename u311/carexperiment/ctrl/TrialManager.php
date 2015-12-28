<?php

namespace u311\carexperiment\ctrl;

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

use u311\carexperiment\config\Config as Config;

class TrialManager {

    /**Get the start and end difference between NOW and the closest trial
     * 
     * @return \stdClass
     */
    static function getNextTrialTime() {

        $config = Config::getConfig("db");
        
        $mysqli = new \mysqli($config["server"], $config["username"], $config["password"], $config["name"], $config["port"]);

        if ($mysqli->connect_errno) {
            $this->throwDBExceptionOnError( $mysqli->connect_error, $mysqli->connect_errno);
        }

        //Find if there is a username/password matching the input
        $next_trial_start_q = "SELECT TIME_TO_SEC(TIMEDIFF(start,now())),TIME_TO_SEC(TIMEDIFF(end,now())) FROM `gametrials` WHERE end > NOW() ORDER BY start LIMIT 1";
        
        if (!$stmt = $mysqli->prepare($next_trial_start_q)) {
            $this->throwDBExceptionOnError($mysqli->error, $mysqli->errno);
        }

        if (!$stmt->execute()) {
            $this->throwDBExceptionOnError($mysqli->error, $mysqli->errno);
        }
        
        
        $diff = new \stdClass();
        $diff->start = -1;
        $diff->end = -1;
        
        
        if( ! $stmt->bind_result($diff->start,$diff->end))
        {
            $this->throwDBExceptionOnError($mysqli->error, $mysqli->errno);
        }
        
        if( ! $stmt->fetch())
        {
            $diff->start = -1;
            $diff->end = -1;
        }
        
        $stmt->free_result();
        $stmt->close();
        $mysqli->close();
        
        /*
         * The return value contains to elements, start and end in seconds
         */
        return $diff;
    }

    protected function throwDBExceptionOnError($errmsg, $errno) {
        throw new Exception($errmsg, $errno);
    }

}
