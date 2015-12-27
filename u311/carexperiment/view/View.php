<?php

namespace u311\carexperiment\view;

class View {
    //put your code here
    private $twig_env;
    private $tmpl;
    
    function __construct($template_dir) {

        $loader = new \Twig_Loader_Filesystem($template_dir);
        $this->twig_env = new \Twig_Environment($loader, array('debug' => FALSE));
    }
    
    function loadTemplate($filename)
    {
        $this->tmpl = $this->twig_env->loadTemplate($filename);
    }

    public function render($arr_variables) {

        if (is_array($arr_variables)) {
            return $this->tmpl->render($arr_variables);
        } 
           
        return $this->tmpl->render([]);
        
    }

}
