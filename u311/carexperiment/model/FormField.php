<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace u311\carexperiment\model;

class FormField
{
    /* @var $name Field name */
    private $name;
    
    /* @var $value Field valued */
    private $value;
    
    /* @var $variable Is the field required */
    private $required;
    
    public function __construct($name,$value,$required) {
        $this->name = $name;
        $this->value = $value;
        $this->required = $required;
    }
    
    public function getName() {
        return $this->name;
    }
    
    public function setValue($value){
        $this->value = $value;
    }
    
    public function getValue(){
        return $this->value;
    }
    
    public function is_required()
    {
        return $this->required;
    }
    
}