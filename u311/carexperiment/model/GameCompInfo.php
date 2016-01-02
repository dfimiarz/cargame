<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace u311\carexperiment\model;

/**
 * Description of LoginCredentials
 *
 * @author DanielF
 */
class GameCompInfo {
   
    public $comp_code;
    public $score;
    public $user_id;
    
    public function __construct($user_id,$comp_code,$score) {
        $this->user_id = $user_id;
        $this->score = $score;
        $this->comp_code = $comp_code;
    }
    
    function getCompCode() {
        return $this->comp_code;
    }

    function getScore() {
        return $this->score;
    }

    function getUserId() {
        return $this->user_id;
    }


}
