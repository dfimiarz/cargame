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
    protected function throwDBExceptionOnError($errmsg,$errno) {
        
        throw new \Exception($errmsg, $errno);
    }

    protected function throwCustomExceptionOnError($errmsg,$errno = 0) {
        
        throw new \Exception($errmsg,$errno);
    }



}


