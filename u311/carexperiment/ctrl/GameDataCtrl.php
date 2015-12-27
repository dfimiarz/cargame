<?php

namespace u311\carexperiment\ctrl;

use u311\carexperiment\config\DbConnectInfo as DbConnectInfo;
use u311\carexperiment\ctrl\DataCtrl as DataCtrl;
use u311\carexperiment\model\FormField as FormField;

class GameDataCtrl extends DataCtrl {

    private $mysqli_con;

    //Class constructor
    function __construct(\mysqli $mysqli_con = null) {

        parent::__construct();

        $dbinfo = DbConnectInfo::getDBConnectInfoObject();

        if (!$mysqli_con) {
            @$this->mysqli_con = new \mysqli($dbinfo->getServer(), $dbinfo->getUserName(), $dbinfo->getPassword(), $dbinfo->getDatabaseName(), $dbinfo->getPort());

            if ($this->mysqli_con->connect_errno) {
                $this->throwDBExceptionOnError($this->mysqli_con->connect_errno, $this->mysqli_con->connect_error);
            }
        } else {
            $this->mysqli_con = $mysqli_con;
        }
    }

    function recordSurveyClick($user_id, $action, $state) {

        $query = "INSERT INTO flappy_car VALUES(null,now(),?,?,?)";

        if (!$stmt = $this->mysqli_con->prepare($query)) {
            $this->throwDBExceptionOnError($this->mysqli_con->errno, $this->mysqli_con->error);
        }

        if (!$stmt->bind_param('idd', $user_id, $action, $state)) {
            $this->throwDBExceptionOnError($this->mysqli_con->errno, $this->mysqli_con->error);
        }

        if (!$stmt->execute()) {
            $this->throwDBExceptionOnError($stmt->errno, $stmt->error);
        }

        $stmt->close();
    }

    function recordSuveyResult(array $form_fields, $user_id) {

        $fields = ['survey_id' => 0, 'Q1' => null, 'Q2' => null, 'Q3' => null, 'Q4' => null, 'Q5' => null, 'Q6' => null, 'Q7' => null, 'Q8' => null, 'Q9' => null, 'Q10' => null, 'Q11' => null, 'Q12' => null, 'Q13' => null, 'Q14' => null, 'Q15' => null];

        /* @var $field FormField */
        foreach ($form_fields as $field) {
            if (array_key_exists($field->getName(), $fields)) {
                $fields[$field->getName()] = $field->getValue();
            }
        }



        $query = "INSERT INTO `surveys` (`user_id`,`survey_id`,`date`,`Question1`,`Question2`,`Question3`,`Question4`,`Question5`,`Question6`,`Question7`,`Question8`,`Question9`,`Question10`,`Question11`,`Question12`,`Question13`,`Question14`,`Question15`) VALUES (?,?,now(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        if (!$stmt = $this->mysqli_con->prepare($query)) {
            $this->throwDBExceptionOnError($this->mysqli_con->errno, $this->mysqli_con->error);
        }

        if (!$stmt->bind_param('iisssssssssssssss', $user_id, $fields['survey_id'], $fields['Q1'], $fields['Q2'], $fields['Q3'], $fields['Q4'], $fields['Q5'], $fields['Q6'], $fields['Q7'], $fields['Q8'], $fields['Q9'], $fields['Q10'], $fields['Q11'], $fields['Q12'], $fields['Q13'], $fields['Q14'], $fields['Q15'])) {
            $this->throwDBExceptionOnError($this->mysqli_con->errno, $this->mysqli_con->error);
        }

        if (!$stmt->execute()) {
            $this->throwDBExceptionOnError($stmt->errno, $stmt->error);
        }

        $stmt->close();
    }

    function get_performance() {
        //scores submitted during last 3 minutes: 
        $scores_submitted = "select count(*) from U311.flappy_car where time-( now() - INTERVAL 3 minute)>0 and time-( now() - INTERVAL 20 second)<0 and user_action<6 and user_action>0; ";
        if (!$stmt = mysqli_prepare($this->mysqli_con, $scores_submitted)) {
            $this->throwDBError($this->mysqli_con->error, $this->mysqli_con->errno);
        }
        if (!mysqli_stmt_execute($stmt)) {
            $this->throwDBError($this->mysqli_con->error, $this->mysqli_con->errno);
        }
        $scores_num = null;

        if (!mysqli_stmt_bind_result($stmt, $scores_num)) {
            $this->throwDBError($this->mysqli_con->error, $this->mysqli_con->errno);
        }
        mysqli_stmt_fetch($stmt);
        mysqli_stmt_close($stmt);


        //shuttle choices during last 2 minutes: 
        $shuttle_choices = "select count(*) from flappy_car where time-( now() - INTERVAL 3 minute)>0 and time-( now() - INTERVAL 20 second)<0 and user_action=3000; ";
        if (!$stmt = mysqli_prepare($this->mysqli_con, $shuttle_choices)) {
            $this->throwDBError($this->mysqli_con->error, $this->mysqli_con->errno);
        }
        if (!mysqli_stmt_execute($stmt)) {
            $this->throwDBError($this->mysqli_con->error, $this->mysqli_con->errno);
        }
        $rides_num = null;

        if (!mysqli_stmt_bind_result($stmt, $rides_num)) {
            $this->throwDBError($this->mysqli_con->error, $this->mysqli_con->errno);
        }
        mysqli_stmt_fetch($stmt);
        mysqli_stmt_close($stmt);



        //detour choices during last 2 minutes: 
        $detour_choices = "select count(*) from flappy_car where time-( now() - INTERVAL 3 minute)>0 and time-( now() - INTERVAL 20 second)<0 and user_action=2000; ";
        if (!$stmt = mysqli_prepare($this->mysqli_con, $detour_choices)) {
            $this->throwDBError($this->mysqli_con->error, $this->mysqli_con->errno);
        }
        if (!mysqli_stmt_execute($stmt)) {
            $this->throwDBError($this->mysqli_con->error, $this->mysqli_con->errno);
        }
        $detours_num = null;

        if (!mysqli_stmt_bind_result($stmt, $detours_num)) {
            $this->throwDBError($this->mysqli_con->error, $this->mysqli_con->errno);
        }
        mysqli_stmt_fetch($stmt);
        mysqli_stmt_close($stmt);

        //  performance based only on % feedback from shuttle riders
        if (($rides_num) < 2) {
            $performance = 0.5;
        } // not enough data
        else {
            $performance = $scores_num / $rides_num;
        }

        //  performance based on both on service usage and %feedback
        //if(($rides_num+$detours_num)<2){ $performance=0.5; } // not enough data
        //else{ $performance=$scores_num/($rides_num+$detours_num); }

        if ($performance > 1) {
            $performance = 1;
        } // in case of missbalance...




        /*

          // here we compute the correlation:
          $dataExists=true;
          // first find average scores for the four intervals:

          $avgScore1="SELECT avg(user_action) from flappy_car where time-( now() - INTERVAL 45 second)>0 and time-( now())<0 and user_action<6 and user_action>0;";
          $avgScore2="SELECT avg(user_action) from flappy_car where time-( now() - INTERVAL 90 second)>0 and time-( now()- INTERVAL 45 second)<0 and user_action<6 and user_action>0;";
          $avgScore3="SELECT avg(user_action) from flappy_car where time-( now() - INTERVAL 135 second)>0 and time-( now()- INTERVAL 90 second)<0 and user_action<6 and user_action>0;";
          $avgScore4="SELECT avg(user_action) from flappy_car where time-( now() - INTERVAL 180 second)>0 and time-( now()- INTERVAL 135 second)<0 and user_action<6 and user_action>0;";

          $stmt = mysqli_prepare($this->mysqli_con, $avgScore1);
          mysqli_stmt_execute($stmt);
          $averageScore[0]=null;
          mysqli_stmt_bind_result($stmt, $averageScore[0]);
          mysqli_stmt_fetch($stmt);
          mysqli_stmt_close($stmt);

          $stmt = mysqli_prepare($this->mysqli_con, $avgScore2);
          mysqli_stmt_execute($stmt);
          $averageScore[1]=null;
          mysqli_stmt_bind_result($stmt, $averageScore[1]);
          mysqli_stmt_fetch($stmt);
          mysqli_stmt_close($stmt);

          $stmt = mysqli_prepare($this->mysqli_con, $avgScore3);
          mysqli_stmt_execute($stmt);
          $averageScore[2]=null;
          mysqli_stmt_bind_result($stmt, $averageScore[2]);
          mysqli_stmt_fetch($stmt);
          mysqli_stmt_close($stmt);

          $stmt = mysqli_prepare($this->mysqli_con, $avgScore4);
          mysqli_stmt_execute($stmt);
          $averageScore[3]=null;
          mysqli_stmt_bind_result($stmt, $averageScore[3]);
          mysqli_stmt_fetch($stmt);
          mysqli_stmt_close($stmt);

          if($averageScore[0]<1 || $averageScore[1]<1 || $averageScore[2]<1 || $averageScore[3]<1) $dataExists=false;

          // second find average performance for the four intervals:

          $avgPerformance1="SELECT avg(user_action) from flappy_car where time-( now() - INTERVAL 45 second)>0 and time-( now())<0 and user_action<8100 and user_action>7999;";
          $avgPerformance2="SELECT avg(user_action) from flappy_car where time-( now() - INTERVAL 90 second)>0 and time-( now()- INTERVAL 45 second)<0 and user_action<8100 and user_action>7999;";
          $avgPerformance3="SELECT avg(user_action) from flappy_car where time-( now() - INTERVAL 135 second)>0 and time-( now()- INTERVAL 90 second)<0 and user_action<8100 and user_action>7999;";
          $avgPerformance4="SELECT avg(user_action) from flappy_car where time-( now() - INTERVAL 180 second)>0 and time-( now()- INTERVAL 135 second)<0 and user_action<8100 and user_action>7999;";

          $stmt = mysqli_prepare($this->mysqli_con, $avgPerformance1);
          mysqli_stmt_execute($stmt);
          $averagePerformance[0]=null;
          mysqli_stmt_bind_result($stmt, $averagePerformance[0]);
          mysqli_stmt_fetch($stmt);
          mysqli_stmt_close($stmt);

          $stmt = mysqli_prepare($this->mysqli_con, $avgPerformance2);
          mysqli_stmt_execute($stmt);
          $averagePerformance[1]=null;
          mysqli_stmt_bind_result($stmt, $averagePerformance[1]);
          mysqli_stmt_fetch($stmt);
          mysqli_stmt_close($stmt);

          $stmt = mysqli_prepare($this->mysqli_con, $avgPerformance3);
          mysqli_stmt_execute($stmt);
          $averagePerformance[2]=null;
          mysqli_stmt_bind_result($stmt, $averagePerformance[2]);
          mysqli_stmt_fetch($stmt);
          mysqli_stmt_close($stmt);

          $stmt = mysqli_prepare($this->mysqli_con, $avgPerformance4);
          mysqli_stmt_execute($stmt);
          $averagePerformance[3]=null;
          mysqli_stmt_bind_result($stmt, $averagePerformance[3]);
          mysqli_stmt_fetch($stmt);
          mysqli_stmt_close($stmt);

          if($averagePerformance[0]<8000 || $averagePerformance[1]<8000 || $averagePerformance[2]<8000 || $averagePerformance[3]<8000) $dataExists=false;




          // new version for calculationg correlation
          //scores array during last 3 minutes:
          $scores_arr="select user_action, game_state from U311.flappy_car where time-( now() - INTERVAL 3 minute)>0 and time-( now())<0 and user_action>90000; ";
          $stmt = mysqli_prepare($this->mysqli_con, $scores_arr);
          mysqli_stmt_execute($stmt);
          $scores_val = null;
          $perf_val=null;
          mysqli_stmt_bind_result($stmt, $scores_val, $perf_val);

          while(mysqli_stmt_fetch($stmt)){
          $performances_array[]=$scores_val;
          $scores_array[]=$perf_val;
          }
          mysqli_stmt_close($stmt);

         */


        /*


          //scores array during last 3 minutes:
          $scores_arr="select user_action from U311.flappy_car where time-( now() - INTERVAL 5 minute)>0 and time-( now())<0 and user_action<6 and user_action>0; ";
          if( ! $stmt = mysqli_prepare($this->mysqli_con, $scores_arr)){
          $this->throwDBError($this->mysqli_con->error, $this->mysqli_con->errno);
          }
          if( ! mysqli_stmt_execute($stmt)){
          $this->throwDBError($this->mysqli_con->error, $this->mysqli_con->errno);
          }
          $scores_val = null;
          mysqli_stmt_bind_result($stmt, $scores_val);

          while(mysqli_stmt_fetch($stmt)){
          $scores_array[]=$scores_val;
          }
          mysqli_stmt_close($stmt);



          //performance array during last 3 minutes:
          $performances_arr="select user_action from U311.flappy_car where time-( now() - INTERVAL 5 minute)>0 and time-( now())<0 and user_action<8100 and user_action>7999; ";
          if( ! $stmt = mysqli_prepare($this->mysqli_con, $performances_arr)){
          $this->throwDBError($this->mysqli_con->error, $this->mysqli_con->errno);
          }
          if( ! mysqli_stmt_execute($stmt)){
          $this->throwDBError($this->mysqli_con->error, $this->mysqli_con->errno);
          }
          $performances_val = null;
          mysqli_stmt_bind_result($stmt, $performances_val);

          while(mysqli_stmt_fetch($stmt)){
          $performances_array[]=$performances_val;
          }
          mysqli_stmt_close($stmt);


          // now we have our two arrays, we need to make them of equal size
          $c1 = count($performances_array);
          $c2 = count($scores_array);

          $index=min($c1,$c2);
          for($i=0; $i<$index; $i++){
          $perf[$i]= -1*$performances_array[$i]+8000; // this will give us positive correlation of scores and delay
          $scr[$i]=$scores_array[$i];
          }
         * 
         * 

          $dataExists=count($performances_array);
          //if($dataExists>3)$correlation = $this->Corr($averageScore,$averagePerformance);//stats_stat_correlation($perf,$scr);

          // here we calculate the correlation
          if($dataExists>3)$correlation = $this->Corr($performances_array, $scores_array);//stats_stat_correlation($perf,$scr);
          else $correlation = -99;
         */
        // and here we replace correlation with usage 
        if ($rides_num + $detours_num == 0)
            $correlation = 0;
        else
            $correlation = $rides_num / ($rides_num + $detours_num);


        $today = getdate();
        $minute = $today['minutes'];
        /*   $tmp=rand(1,100)/200;

          // This is for the oscillations 3 minutes mode:
          if($minute<6){$performance=1; $correlation = -99;}
          else if($minute>5 && $minute<9){$performance=0; $correlation = -99;}
          else if($minute>8 && $minute<12){$performance=1; $correlation = -99;}
          else if($minute>11 && $minute<15){$performance=0; $correlation = -99;}
          else if($minute>14 && $minute<18){$performance=1; $correlation = -99;}
          else if($minute>17 && $minute<21){$performance=0; $correlation = -99;}
          else if($minute>20 && $minute<24){$performance=1; $correlation = -99;}
          else if($minute>23 && $minute<27){$performance=0; $correlation = -99;}
          else {$performance=1; $correlation = -99;}
         */

// This is for the recovery with motivated provider later. 0.28 should go with good performance in Game.JS to give 7.5 = 15seconds rides = detour:   
        //   if($minute<7){$performance=0.28; $correlation = -99;} // else use the shuttle robot...
// This is for the corr = usage mode:
        if ($minute < 7) {
            $performance = 0.28;
            $correlation = 0.28;
        }


// This is for the recovery mode, 0.5 should go with poor performance in Game.JS to give 7.5 = 15seconds rides = detour:
        //  if($minute<7){$performance=0.5; $correlation = -99;} // first 6 minutes slow
        // else if($minute<17){$performance=1;$correlation = -99;} // next 10 minutes fast
        // else {$performance=0.5; $correlation = -99;} // last part slow again
        //if($minute==5 || $minute==6){$performance=1;$correlation = -99;}


        /*
        $array_dump = print_r($performances_array, true);
        $array_dump .= print_r($scores_array, true);
        */
        $array_dump = array();
        $retVal = new \stdClass();
        $retVal->correlation = $correlation;
        $retVal->performance = $performance;
        $retVal->debug = $array_dump;


        return $retVal;
    }

    function Corr($x, $y) {
        $length = count($x);
        $mean1 = array_sum($x) / $length;
        $mean2 = array_sum($y) / $length;

        $a = 0;
        $b = 0;
        $axb = 0;
        $a2 = 0;
        $b2 = 0;

        for ($i = 0; $i < $length; $i++) {
            $a = $x[$i] - $mean1;
            $b = $y[$i] - $mean2;
            $axb = $axb + ($a * $b);
            $a2 = $a2 + pow($a, 2);
            $b2 = $b2 + pow($b, 2);
        }

        $corr = $axb / sqrt($a2 * $b2);
        return $corr;
    }

    function getSystemStats() {
        $data = new \stdClass();
        $data->scores_num = array(0, 0, 0);
        $data->scores_avg = $this->getAverage(45); //30 //2
        $data->shuttle_rides = array(0, 0, 0);
        $data->detours_num = array(0, 0, 0);

        return $data;
    }

    private function getAverage($interval) {
        $results = [];
        $value = 0;

        $l_int = 0;
        $h_int = 0;

        $query = "SELECT avg(user_action) as value FROM flappy_car WHERE time > DATE_SUB(now(),INTERVAL ? second) AND time < DATE_SUB(now(),INTERVAL ? second) AND user_action > 0 AND user_action < 6";

        if (!$stmt = $this->mysqli_con->prepare($query)) {
            $this->throwDBExceptionOnError($this->mysqli_con->errno, $this->mysqli_con->error);
        }

        for ($i = 0; $i < 3; $i++) {

            $l_int = $h_int;
            $h_int += $interval;
            $value = 0;

            if (!$stmt->bind_param('ii', $h_int, $l_int)) {
                $this->throwDBExceptionOnError($this->mysqli_con->errno, $this->mysqli_con->error);
            }

            if (!$stmt->execute()) {
                $this->throwDBExceptionOnError($stmt->errno, $stmt->error);
            }

            if (!$stmt->bind_result($value)) {
                $this->throwDBExceptionOnError($stmt->errno, $stmt->error);
            }

            if (!$stmt->fetch()) {
                $this->throwDBExceptionOnError($stmt->errno, $stmt->error);
            }

            if (is_null($value)) {
                $value = 0;
            }

            $results[] = $value;
        }

        $stmt->close();

        return $results;
    }

}
