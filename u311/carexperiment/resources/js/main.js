/* Change log
 2015-02-21
 - Daniel F. Added action_codes variable (object) storing all the user actions codes by name and value. 
 Do not use values 0 for action codes
 
 */

var game,f_start_time;
var dialog1_done=false;
var dialog2_done=false;
var session=1;


// start and run the game
window.onload = function () {
    main();
};


/**
 * Starts and initialize the game
 */
function main() {

    game = new Game();
    

    window.addEventListener("resize", resizeWindow);
    window.addEventListener("keydown", game.inputcomp.handleKeyDown.bind(game.inputcomp));
    window.addEventListener("keyup", game.inputcomp.handleKeyUp.bind(game.inputcomp));
    window.addEventListener("mousedown", game.inputcomp.handleMouseDown.bind(game.inputcomp));
    window.addEventListener("mouseup", game.inputcomp.handleMouseUp.bind(game.inputcomp));
    
    width = game.pref_width;
    height = game.pref_height;

    document.body.appendChild(game.pixi_renderer.view);

    PIXI.loader
    .add('road_light_forest','./u311/carexperiment/resources/images/sprites/road_light_forest.png')
    .add('car_blue','./u311/carexperiment/resources/images/sprites/car_blue.png')
    .add('car_shuttle','./u311/carexperiment/resources/images/sprites/car_shuttle.png')
    .add('road_decision','./u311/carexperiment/resources/images/sprites/road_junction.png')
  //  .add('junction_road','./u311/carexperiment/resources/images/sprites/shuttle_ride_bg.png')
    .add('detour_road','./u311/carexperiment/resources/images/sprites/lake_road.png')
    .add('shuttle_road','./u311/carexperiment/resources/images/sprites/shuttle_road.png')
    .add('coin','./u311/carexperiment/resources/images/sprites/coin.json')
    .add('dashboard_img','./u311/carexperiment/resources/images/sprites/dashboard.png')
    .add('shuttle_wait_img','./u311/carexperiment/resources/images/sprites/shuttle_wait.png')
    .add('shuttle_unload_img','./u311/carexperiment/resources/images/sprites/shuttle_unloading.png')
    .add('feedback_decision_img','./u311/carexperiment/resources/images/sprites/feedback_decision.png')
    .add('dock_img','./u311/carexperiment/resources/images/sprites/shuttle_dock.png')
    .add('arrival_dock_img','./u311/carexperiment/resources/images/sprites/arrival_dock.png')
    .load(initGameObjects);
}

function initGameObjects(loader,resource)
{
   
    car_texture = resource.car_blue.texture;
    game.objects["car"] = new Car(car_texture);
    
    car_shuttle_texture = resource.car_shuttle.texture;
    game.objects["car_shuttle"] = new Car(car_shuttle_texture);

    dashboard_texture = resource.dashboard_img.texture;
    game.objects["dashboard"] = new PIXI.Sprite(dashboard_texture);

    shuttle_Wait_texture = resource.shuttle_wait_img.texture;
    game.objects["shuttle_wait"] = new PIXI.Sprite(shuttle_Wait_texture);

    feedback_decision_texture = resource.feedback_decision_img.texture;
    game.objects["feedback_decision"] = new PIXI.Sprite(feedback_decision_texture);

    shuttle_unload_texture = resource.shuttle_unload_img.texture;
    game.objects["shuttle_unload"] = new PIXI.Sprite(shuttle_unload_texture);
    
    dock_texture = resource.dock_img.texture;
    game.objects["dock"] = new PIXI.Sprite(dock_texture);
    
    arrival_dock_texture = resource.arrival_dock_img.texture;
    game.objects["arrival_dock"] = new PIXI.Sprite(arrival_dock_texture);

    game.objects["splash_txt"] = new PIXI.Text('press spacebar to begin', { font: 'bold italic 32px Arvo', fill: '#3e1707', align: 'center', stroke: '#a4410e', strokeThickness: 7 });
    game.objects["splash_txt"].position.x = game.pref_width/2;
    game.objects["splash_txt"].position.y = game.pref_width/2;
    game.objects["splash_txt"].anchor.x = 0.5;
    
    game.objects["speed_txt"] = new PIXI.Text('Speed:', { font: 'bold 14px Arial', fill: '#FFFFFF', align: 'center', stroke: '#000000', strokeThickness: 2 });
    game.objects["distance_txt"] = new PIXI.Text('Distance:', { font: 'bold 14px Arial', fill: '#FFFFFF', align: 'center', stroke: '#000000', strokeThickness: 2 });
    game.objects["coins_txt"] = new PIXI.Text('Coins:', { font: 'bold 14px Arial', fill: '#FFFFFF', align: 'center', stroke: '#000000', strokeThickness: 2 });
    
    main_road_t = resource.road_light_forest.texture;
    game.objects["road_main"] = new Road(main_road_t);
    game.objects["road_main"].r_limit = 384;
    game.objects["road_main"].l_limit = 128;
    
 //   junction_road_t = resource.junction_road.texture;
 //   game.objects["road_junction"] = new Road(junction_road_t);
 //   game.objects["road_junction"].r_limit = 384;
 //   game.objects["road_junction"].l_limit = 128;
    
    detour_road_t = resource.detour_road.texture;
    game.objects["road_detour"] = new Road(detour_road_t);
    game.objects["road_detour"].r_limit = 128;
    game.objects["road_detour"].l_limit = 384;

    decision_road_t = resource.road_decision.texture;
    game.objects["road_decision"] = new Road(decision_road_t);
    game.objects["road_decision"].r_limit = 384;
    game.objects["road_decision"].l_limit = 128;
    
    shuttle_road_t = resource.shuttle_road.texture;
    game.objects["road_shuttle"] = new Road(shuttle_road_t);
    game.objects["road_shuttle"].r_limit = 128;
    game.objects["road_shuttle"].l_limit = 384;
   
    //array of coins used by the game. Init as empty
    game.objects["coins"] = [];
    
    //Load coin textures
    var coin_textures = [];

    for (i = 0; i < 8; i++)
    {
        coin_textures.push(resource.coin.textures[i]);
    }
    
    //and create and pool of 20 coins to reuse
    
    for( i = 0; i < 20; i++)
    {
        var coin = new Coin(coin_textures);
        coin.setState(new CoinState_NEW(game,coin));
        
        game.objects["coins"].push(coin);
    }
   
    
    run();
}


/**
 * Starts and update gameloop
 */
function run() {
    game.init();
   // console.log("Starting the game loop");
    loop();
}

/*
 * 1/19/2015 Took out the loop animation out of the run method 
 */
function loop(timestamp)
{
    /*
    Calculate time passed since the last frame was rendered (d_t) in miliseconds
    */
    if( ! f_start_time ){
        f_start_time = timestamp;
    }   
    
    var d_t = timestamp - f_start_time;
    f_start_time = timestamp;
    
    //console.log("Frame duration" + d_t)
    game.update(d_t);
    
    game.render();
    
    requestAnimationFrame(loop);
}






function Report_user_action(user_choice, game_state) // choice will return 1 for shuttle and 2 for detour
{
    //return;
    var state2 = (session * 10) + game_state;
    var client = new XMLHttpRequest();
    var postdata = "action=" + encodeURIComponent(unescape(user_choice)) + "&state=" + encodeURIComponent(unescape(state2));
    client.open("POST", "./u311/carexperiment/ctrl/saveClickData.php");
    client.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    client.send(postdata);
}


function reportScore(score)
{
    //return;
    var client = new XMLHttpRequest();
    var postdata = "score=" + encodeURIComponent(unescape(score));
    client.open("POST", "./u311/carexperiment/ctrl/registerScore.php");
    client.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    client.onreadystatechange = function () {
        if (client.readyState === 4 && client.status === 200) {
            var result = client.responseText; // need to parse...
            var json_obj = JSON.parse(result);
            
            window.location.replace("./survey.php");
        }
    };
    client.send(postdata);
    

}



function set_shuttle_performance() // choice will return 1 for shuttle and 2 for detour
{
    get_performance();
    /*
     
     if(session===1)
     {
     if(ind===1) {shuttle_wait=shuttle_wait_med; shuttle_speed=shuttle_speed_med; popup=0; }
     else if(ind===2) {shuttle_wait=shuttle_wait_short; shuttle_speed=shuttle_speed_high; popup=1; performance_mem=0;}
     else if(ind===3) {shuttle_wait=shuttle_wait_long; shuttle_speed=shuttle_speed_high; popup=0;}
     else if(ind===4) {shuttle_wait=shuttle_wait_med; shuttle_speed=shuttle_speed_low; popup=1; performance_mem=20;}
     else  {shuttle_wait=shuttle_wait_short; shuttle_speed=shuttle_speed_low;popup=0; } 
     if(overide)popup=0;
     }
     else get_performance();
     
     ind++;
     
     // this is for the one shot control experiments: no choices, no popups  
     if(ind===1)       {shuttle_wait=250; shuttle_speed=2.5; popup=0; }
     else if(ind===2) {shuttle_wait=250; shuttle_speed=2.5; popup=0; }
     else if(ind===3) {shuttle_wait=250; shuttle_speed=2.5; popup=0; }
     else if(ind===4) {shuttle_wait=250; shuttle_speed=2.5; popup=0; }
     else             {shuttle_wait=250; shuttle_speed=2.5; popup=0; }
     */
}






function resizeWindow(){
    
    win_width = window.innerWidth;
    win_height = window.innerHeight;
    
    ratio  = 1;
    
    if( win_width < game.pref_width || win_height < game.pref_height){
        ratio = Math.min(window.innerWidth/game.pref_width ,window.innerHeight/game.pref_height);
    }
    game.pixi_stage.scale.x = game.pixi_stage.scale.y = ratio;
    
    game.pixi_renderer.resize(Math.ceil(game.pref_width*ratio),Math.ceil(game.pref_height*ratio));
    
}

function get_shuttle_stats()
{
    var client = new XMLHttpRequest();
    client.open("GET", "./u311/carexperiment/ctrl/getShuttleStats.php"); //Math.random is used to make the URL unique to prevent caching
    client.send();
    client.onreadystatechange = function () {
        if (client.readyState == 4 && client.status == 200) {
            stats = client.responseText; // need to parse...
            var json_obj = JSON.parse(stats);

            var avg_array = json_obj.data.scores_avg;
            /*
             * Paring JSON object
             * Make sure to handle errors!!!
             */

            max = 6
            min = 0;

            shuttle_feedback[0] = avg_array[0];//Math.floor(Math.random() * (max - min)) + min;
            shuttle_feedback[1] = avg_array[1];//Math.floor(Math.random() * (max - min)) + min;
            shuttle_feedback[2] = avg_array[2];//Math.floor(Math.random() * (max - min)) + min;
            var scr = Math.round(shuttle_feedback[0]) + Math.round(shuttle_feedback[1]) * 10 + Math.round(shuttle_feedback[2]) * 100;
            scr = scr + 7000;//+shuttle_feedback[0]+(shuttle_feedback[1]*10)+(shuttle_feedback[2]*100);
            Report_user_action(scr, stage - 1);

        }
    }

}



function get_performance() // choice will return 1 for shuttle and 2 for detour
{
    var performance_duration;
    feedbacks_num = 0;
    var client = new XMLHttpRequest();
    client.open("GET", "./u311/carexperiment/ctrl/getPerformance.php"); //Math.random is used to make the URL unique to prevent caching
    client.send();
    client.onreadystatechange = function () {
        if (client.readyState === 4 && client.status === 200) {
            feedbacks = client.responseText; // need to parse...
            var obj = JSON.parse(feedbacks);
            feedbacks_num = Number(obj.data.performance);
            feedbacks_corr = Number(obj.data.correlation);

            // this is for the case where we converted corr into usage
            var shuttle_usage = feedbacks_corr;
            performance_duration = ((-12.5 * feedbacks_num) + (-12.5 * shuttle_usage) + 22) / 2; // good performance

            // this is for the experiments where performance is only affecte by % feedback from shuttle riders (excluding detours)
            // performance_duration = ((-30) * feedbacks_num + 30) / 2; 

            // this is for good, feedback driven performance experiments
            //performance_duration = ((-25) * feedbacks_num + 22) / 2; // good performance

            // this is for poor, feedback driven performance experiments: 
            //performance_duration = ((-28) * feedbacks_num + 29) / 2; // bad performance
            /*             
             // this is for the correlation dependent experiments:
             if(feedbacks_corr!==-99) {
             performance_duration+=feedbacks_corr*10; // note that correlation between duration and score should be negative, reducing duration
             performance_duration+=3; // a panalty so that only correlation above 0.3 will help.
             Report_user_action(8500+(100*feedbacks_corr), stage - 1);
             }
             */
            if (performance_duration < 0) {
                performance_duration = 0;
            }
            Report_user_action(8000 + performance_duration, stage - 1);
            performance_mem = performance_duration;
            shuttle_wait = performance_duration * 60;
            shuttle_speed = -0.112 * performance_duration + 2.455;
            if (shuttle_speed < 0.2)
                shuttle_speed = 0.2; // prevent shuttle from stalling

        }
    }
}

function btnClickHandler()
{
    var client = new XMLHttpRequest();
    var postdata = "action=1&state=1";


    client.open("POST", "./u311/carexperiment/ctrl/saveClickData.php");
    client.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    client.onreadystatechange = function () {
        if (client.readyState == client.DONE && client.status == 200) {
            alert(client.responseText);
        }
    };

    client.send(postdata);

}

function showDialog()
{

    var w = window.innerWidth;
    var h = window.innerHeight;


    var dialog = document.getElementById("rating_dialog");
    dialog.style.display = "block";
    dialog.style.position = "absolute";
    dialog.style.left = ((w - dialog.offsetWidth) / 2) + "px";
    dialog.style.top = ((h - dialog.offsetHeight) / 2) + "px";

    var checkbox = document.getElementById("rating_c_box");
    checkbox.checked = false;

    isGamePaused = true;

}

function hideRatingDialog()
{
    var dialog = document.getElementById("rating_dialog");
    dialog.style.display = "none";
    isGamePaused = false;
}


function saveRatingDialog(client_score)
{

    //client_score_mem=client_score;
    var performance_mem=1;

    //alert('popup'+popup);
    if (client_score === -999) // user decided to bail out...
    {
        overide = true;
        var yyy = false;
        var client = new XMLHttpRequest();
        var postdata = "popup=" + encodeURIComponent(unescape(yyy));
        client.open("POST", "./u311/carexperiment/ctrl/setShowPopup.php");
        client.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        client.send(postdata);
        popup = false;
        var dialog = document.getElementById("rating_dialog");
        dialog.style.display = "none";
        isGamePaused = false;
        dialog1_done = dialog2_done = false;
        game.objects["car"].v=0; this.game.setState(new GamePlayState(this.game) );
    }
    else {
        score1 = client_score;
        dialog1_done = true;
    }

    if (dialog1_done && dialog2_done)
    {
        var state2 = (session * 10);
        var client = new XMLHttpRequest();
        var postdata = "action=" + encodeURIComponent(unescape((score1 + score2) / 2.0)) + "&state=" + encodeURIComponent(unescape(state2));
        client.open("POST", "./u311/carexperiment/ctrl/saveClickData.php");
        client.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        client.send(postdata);

        Report_user_action(99000 + (10 * performance_mem), 99000 + (score1 + score2) / 2.0 - (session * 10));
        Report_user_action(5000, 5000 + score1 - session * 10);
        Report_user_action(5100, 5100 + score2 - session * 10);
        var boxes = document.getElementsByClassName("score_cbox");
        for (var i = 0; i < boxes.length; i++)
        {
            boxes[i].checked = false;
        }

        boxes = document.getElementsByClassName("score_cbox2");
        for (var i = 0; i < boxes.length; i++)
        {
            boxes[i].checked = false;
        }

        var dialog = document.getElementById("rating_dialog");
        dialog.style.display = "none";
        isGamePaused = false;
        dialog1_done = dialog2_done = false;
        game.objects["car"].v=0; this.game.setState(new GamePlayState(this.game) );
    }

}


function saveRatingDialog2(client_score)
{
    var performance_mem=1;
    score2 = client_score;
    dialog2_done = true;

    if (dialog1_done && dialog2_done)
    {
        var state2 = (session * 10);
        var client = new XMLHttpRequest();
        var postdata = "action=" + encodeURIComponent(unescape((score1 + score2) / 2.0)) + "&state=" + encodeURIComponent(unescape(state2));
        client.open("POST", "./u311/carexperiment/ctrl/saveClickData.php");
        client.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        client.send(postdata);

        Report_user_action(99000 + (10 * performance_mem), 99000 + (score1 + score2) / 2.0 - (session * 10));
        Report_user_action(5000, 5000 + score1 - session * 10);
        Report_user_action(5100, 5100 + score2 - session * 10);
        var boxes = document.getElementsByClassName("score_cbox");
        for (var i = 0; i < boxes.length; i++)
        {
            boxes[i].checked = false;
        }

        boxes = document.getElementsByClassName("score_cbox2");
        for (var i = 0; i < boxes.length; i++)
        {
            boxes[i].checked = false;
        }

        var dialog = document.getElementById("rating_dialog");
        dialog.style.display = "none";
        isGamePaused = false;
        dialog1_done = dialog2_done = false;
        game.objects["car"].v=0; this.game.setState(new GamePlayState(this.game) );
    }

}
