<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace u311\carexperiment\model;

use u311\carexperiment\model\FormField as FormField;

class FormValidator
{
    /**
     *
     * @var type array Fields to validate
     */
    
    private $fields;
    
    /**
     *
     * @var type array Holds validation error objects
     */
    private $val_error ;
    
    public function __construct(array $fields) {
        
        $this->fields = $fields;
        $this->val_error = [];
    }
    
    public function validate()
    {
        /*
         * TODO: This is not the most flexible way of doing validation. 
         *  
         */
        
        /* @var $form_field FormField */
        foreach($this->fields as $form_field )
        {
            if ($form_field->is_required()) {
                if (is_null($form_field->getValue())) {
                    $this->val_error[$form_field->getName()] = "This field must be set";
                }
            }
        }
        
        return $this->val_error;
    }
    
}

