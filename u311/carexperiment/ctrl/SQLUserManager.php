<?php

namespace u311\carexperiment\ctrl;

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

use u311\carexperiment\config\Config as Config;

class SQLUserManager {

    static function createUser() {

        $config = Config::getConfig("db");

        $mysqli = new \mysqli($config["server"], $config["username"], $config["password"], $config["name"], $config["port"]);

        
        if ($mysqli->connect_errno) {
            $this->throwDBExceptionOnError( $mysqli->connect_error, $mysqli->connect_errno);
        }

        //Find if there is a username/password matching the input
        $user_insert_q = "INSERT INTO `user` VALUES (null,'AUTO','USER','ok@ok.com',now(),'AUTO CREATE')";
        
        if (!$stmt = $mysqli->prepare($user_insert_q)) {
            $this->throwDBExceptionOnError($mysqli->error, $mysqli->errno);
        }

        if (!$stmt->execute()) {
            $this->throwDBExceptionOnError($mysqli->error, $mysqli->errno);
        }

        $new_user_id = $stmt->insert_id;

        $stmt->free_result();
        $stmt->close();
        $mysqli->close();
        
        return $new_user_id;
    }

    protected function throwDBExceptionOnError($errmsg, $errno) {
        throw new Exception($errmsg, $errno);
    }

}
