<?php

namespace u311\carexperiment\ctrl;

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

use u311\carexperiment\config\Config as Config;
use u311\carexperiment\ctrl\DataCtrl as DataCtrl;
use u311\carexperiment\model\GameCompInfo as GameCompInfo;

class SQLUserManager extends DataCtrl {

    /* @var $mysqli \mysqli */
    private $mysqli = null;
            
    public function __construct() {
        parent::__construct();
        
        $config = Config::getConfig("db");

        $this->mysqli = new \mysqli($config["server"], $config["username"], $config["password"], $config["name"], $config["port"]);

        if ($this->mysqli->connect_errno) {
            $this->throwDBExceptionOnError( $this->mysqli->connect_error, $this->mysqli->connect_errno);
        }
    }
    
    function __destruct() {
        $this->mysqli = null;
    }
            
    function createUser() {
        
        
        
        //Add user query
        $user_insert_q = "INSERT INTO `user` VALUES (null,'AUTO','USER','ok@ok.com',now(),'AUTO CREATE',null,-1)";
        
        /* @var $stmt ClassName */
        if (!$stmt = $this->mysqli->prepare($user_insert_q)) {
            $this->throwDBExceptionOnError($this->mysqli->error, $this->mysqli->errno);
        }

        if (!$stmt->execute()) {
            $this->throwDBExceptionOnError($this->mysqli->error, $this->mysqli->errno);
        }

        $new_user_id = $stmt->insert_id;

        $stmt->free_result();
        $stmt->close();
        $this->mysqli->close();
        
        return $new_user_id;
    }
        
    /**
     * 
     * @param type $user_id
     * @return GameCompInfo
     */
    function getGameCompInfo($user_id) {

        
        
        //Add user query
        $get_comp_info_q = "SELECT `comp_code`, `score` WHERE `id` = ?";
        
        /* @var $stmt ClassName */
        if (!$stmt = $this->mysqli->prepare($get_comp_info_q)) {
            $this->throwDBExceptionOnError($this->mysqli->error, $this->mysqli->errno);
        }
        
        if( ! $stmt->bind_param('i',$user_id)){
            $this->throwDBExceptionOnError($this->mysqli->error, $this->mysqli->errno);
        }

        if (!$stmt->execute()) {
            $this->throwDBExceptionOnError($this->mysqli->error, $this->mysqli->errno);
        }
        
        $comp_code = null;
        $score = null;
        
        if (!$stmt->bind_result($stmt, $comp_code,$score )) {
            $this->throwDBExceptionOnError($this->mysqli->error, $this->mysqli->errno);
        }
        
        mysqli_stmt_fetch($stmt);
        
        
        $stmt->free_result();
        $stmt->close();
        $this->mysqli->close();
        
        $info = new GameCompInfo($user_id,$comp_code,$score);
        
        return $info;
        
    }
    
    function updateCompInfo(GameCompInfo $info)
    {
        //Add user query
        $update_comp_info_q = "UPDATE `user` SET `comp_code` = ?, `score` = ? WHERE `id` = ?";
        
        /* @var $stmt ClassName */
        if (!$stmt = $this->mysqli->prepare($update_comp_info_q)) {
            $this->throwDBExceptionOnError($this->mysqli->error, $this->mysqli->errno);
        }
        
        $comp_code = $info->getCompCode();
        $score = $info->getScore();
        $user_id = $info->getUserId();
        
        if( ! $stmt->bind_param('sii',$comp_code,$score,$user_id)){
            $this->throwDBExceptionOnError($this->mysqli->error, $this->mysqli->errno);
        }

        if (!$stmt->execute()) {
            $this->throwDBExceptionOnError($this->mysqli->error, $this->mysqli->errno);
        }
        
        $stmt->free_result();
        $stmt->close();
        $this->mysqli->close();
        
    }


}
