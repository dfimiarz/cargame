<?php

namespace u311\carexperiment\ctrl;

class DataCtrl
{

    // A private constructor; prevents direct creation of object
    public function __construct()
    {
		
    }

    protected function log($txt,$log_type)
    {
         
    }

    /**
     * Utility function to throw an exception if an error occurs
     * while running a mysql command.
     */
    protected function throwDBExceptionOnError($errno, $errmsg) {
        
        throw new \Exception($errmsg, $errno);
    }

    protected function throwCustomExceptionOnError($errno = 0 ,$errmsg) {
        
        throw new Exception($errmsg,$errno);
    }



}


