/* Change log
 2015-02-21
 - Daniel F. Added action_codes variable (object) storing all the user actions codes by name and value. 
 Do not use values 0 for action codes
 
 */

var     shuttle_feedback = [0,0,0],
        show_feedback=false,
        action_codes = {coin_collect: 1000, shuttle_choice_detour: 2000, shuttle_choice_ride: 3000},
        rnd,
        new_junction = false,
        isGamePaused = false,
        overide = false,
        feedbacks,
        feedbacks_num,
        frameid,
        canvas,
        ctx,
        width,
        height,
        bird_offset = 0,
        hit = 100,
        coin_count = 0,
        shuttleChoice = false,
        shuttle_delay = 0,
        shuttle_wait = 200, //0*Math.random(),
        shuttle_speed = 0.05 + Math.random(),
        performance_mem,        
        delays = false,
        shuttle_retract = 0,
        shuttle_forward = 0,
        detourChoice = false,
        x_offset = 0,
        second_x_offset = 0,
        y_offset = 0,
        second_y_offset = 0,
        stage = 1,
        trial_time = 0,
// version 2
        shuttle_speed_low = 1,
        shuttle_speed_med = 2.5,
        shuttle_speed_high = 4,
        shuttle_wait_long = 700,
        shuttle_wait_med = 250,
        shuttle_wait_short = 20,
// version 1
        /*
         shuttle_speed_low=0.3, 
         shuttle_speed_med=0.8,
         shuttle_speed_high=2,
         shuttle_wait_long=1300,
         shuttle_wait_med=500,
         shuttle_wait_short=100,
         */
        ind = 1, // index to shuttle choices (first, second, etc.)
        every_other_pop = 2,
        first_pop = true,
        session = ServerStateVars.session,
        popup = ServerStateVars.popup,
        /* these are the state variables of the car around the lake: */
        junction_before_choice = false, // during this time the car will go to the junction
        junction_choice = false, // during this time the car waits at the junction
        junction_shuttle_positioning = false, // durign this time the car position itself on the dock after shuttle choice
        junction_wait_for_shuttle = false, // during this stage the care waits for the shuttle at the dock
        junction_taking_detour1 = false, // the car takes the detour 1. down the lake
        junction_taking_detour2 = false, // the car takes the detour 2. starit on bottom of lake
        junction_taking_detour3 = false, // the car takes the detour 3. up the lake towards the end


// plot dynamically "shuttle ride cost 4 coints
        FeedbackChart = {
            x: 0,
            y: 0,
            img: new Image(),
            src_url: "./gamefiles/res/feedbackchart.png",
            init: function ()
            {
                this.img.onload = function ()
                {
                    console.log("Chart loaded");
                };

                this.reload();
            },
            draw: function (ctx)
            {
                console.log("Drawing chart");
                ctx.drawImage(this.img, 130, 280);
            },
            reload: function ()
            {
                console.log("Loading new image");
                this.img.src = this.src_url;
            }
        },
        scrollTextPos = 0,
        fgpos = 0,
        frames = 0,
        score = ServerStateVars.score,
        best = localStorage.getItem("best") || 0,
        currentstate,
        states = {Splash: 0, Game: 1, Score: 2, Junction: 3},
        okbtn, //Ok button initiated in main()
        sharebtn, //Share button initiated in main()
        shuttlebtn,
        detourbtn,
        
        
        bird = { // the car...
            x: 60,
            y: 0,
            w: 30,
            h: 12,
            frame: 0,
            velocity: 0,
            animation: [0, 1, 2, 1], // animation sequence

            rotation: 0,
            radius: 12,
            gravity: 0.25,
            _jump: 4.6,
            //Store sprites inside the car object
            _s_car: [],
            /* Init the car object */
            init: function (img)
            {
                this._s_car.push(new Sprite(img, 145, 165, this.w, this.h));
                this._s_car.push(new Sprite(img, 145, 178, this.w, this.h));
                this._s_car.push(new Sprite(img, 145, 191, this.w, this.h));

            },
            /**
             * Makes the car "flap" and jump
             */
            jump: function () {
                this.velocity = -this._jump;
            },
            /**
             * Update sprite animation and position of car
             */
            update: function () {
                // make sure animation updates and plays faster in gamestate
                var n = currentstate === states.Splash ? 10 : 5;
                this.frame += frames % n === 0 ? 1 : 0;
                this.frame %= this.animation.length;

                // in splash state make car hover up and down and set rotation to zero
                if (currentstate === states.Splash) {
                    this.y = height - 280 + 5 * Math.cos(frames / 10);
                    this.rotation = 0;
                } else if (currentstate === states.Junction) {
                    this.y = bird_offset + height - 180 + 5 * Math.cos(frames / 10);
                    this.rotation = 0;
                    this.x = 75;//135;
                }
                else { // game and score state

                    this.velocity += this.gravity;
                    this.y += this.velocity;

                    // change to the score state when car touches the ground

                    if (this.y >= height - s_fg.height - 10) {
                        this.y = height - s_fg.height - 10;
                        //this.rotation =0.3;
                        this.velocity = 0;
                    }

                    // when car lack upward momentum increment the rotation angle

                    if (this.velocity == 0)
                        this.rotation = 0;
                    else if (this.velocity > 0)
                        this.rotation = 0.4;
                    else if (this.velocity < 0)
                        this.rotation = -0.4;

                }
            },
            /**
             * Draws car with rotation to canvas ctx
             *
             * @param  {CanvasRenderingContext2D} ctx the context used for drawing
             */
            draw: function (ctx) {
                ctx.save();
                // translate and rotate ctx coordinatesystem
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);

                var n = this.animation[this.frame];
                // draws the car with center in origo
                this._s_car[n].draw(ctx, -this._s_car[n].width / 2, -this._s_car[n].height / 2);
                ctx.restore();
            }
        },
/*
 * Coin class
 */
coins = {
    _coins: [],
    reset: function ()
    {
        this._coins = [];
    },
    update: function ()
    {
        // Add a new coin every 100 frames
        if (frames % 100 === 0) {
            var _y = height - (s_coin.height + s_fg.height + 120 + 200 * Math.random());

            this._coins.push({
                x: 500,
                y: _y,
                w: s_coin.width,
                h: s_coin.height
            });
        }


        for (var i = 0, len = this._coins.length; i < len; i++) {
            var c = this._coins[i];

            //Collision detection
            if (c.x < bird.x + bird.w &&
                    c.x + c.w > bird.x &&
                    c.y < bird.y + bird.h &&
                    c.h + c.y > bird.y) {

                c.x = 10000;

                score++;
                coin_count++;
                //Send coin collection message to the server
                Report_user_action(action_codes['coin_collect'], stage - 1);
            }



            c.x -= 2;
            if (c.x < -c.w) {
                this._coins.splice(i, 1);
                i--;
                len--;
                //console.log("Coin removed");
            }
        }
    },
    draw: function (ctx) {

        for (var i = 0, len = this._coins.length; i < len; i++) {
            var c = this._coins[i];
            s_coin.draw(ctx, c.x, c.y);
        }
    }
},
backgroundFx = {
    setBGGradient: function (hour, minute) {      // create linear gradient based upon time of day
        var grd = ctx.createLinearGradient(0, canvas.width / 2, 0, canvas.width);
        grd.addColorStop(0, '#2d91c2');
        grd.addColorStop(1, '#1e528e');
        ctx.fillStyle = grd;
        ctx.fill();
    },
    update: function () {
        if (frames % 60 === 0) {
            var date = new Date;
//var seconds = date.getSeconds();
//var minutes = date.getMinutes();
            var hour = date.getHours();
//var hour = Math.ceil(date.getSeconds()/2.5);  //for debug
//if (hour == 24) hour = 0;
//console.log(hour)
            this.setBGGradient(hour);
        }
    }
};


function reset_game_vars() {

    bird_offset = 0;
    hit = 100;
    shuttleChoice = false;
    shuttle_delay = 0;
    shuttle_wait = 200; //0*Math.random(),
//shuttle_speed=0.05+Math.random();
    delays = false;
    shuttle_retract = 0;
    shuttle_forward = 0;
    detourChoice = false;
    x_offset = 0;
    second_x_offset = 0;
    y_offset = 0;
    second_y_offset = 0;
    stage = 1;
    scrollTextPos = 0;
    fgpos = 0;
    frames = 0;
    best = localStorage.getItem("best") || 0;

}

function ontouch(e)
{
    e.preventDefault();
    console.log("Touch event");

    var touches = e.changedTouches;

    if (touches.length > 0)
    {
        var touch = touches[0];

        var posx = 0;
        var posy = 0;
        
        if (touch.pageX || touch.pageY) {
            posx = touch.pageX;
            posy = touch.pageY;
        }
        else if (touch.clientX || touch.clientY) {
            posx = touch.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = touch.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        var rect = canvas.getBoundingClientRect();
        var x = rect.left + document.body.scrollLeft + document.documentElement.scrollLeft;
        var y = rect.top + document.body.scrollTop + document.documentElement.scrollTop;

        mx = posx - x;
        my = posy - y;

        onpress(mx, my);
    }
}

function onmouse(e)
{

    e.preventDefault();

    var posx = 0;
    var posy = 0;
    if (!e) {
        var e = window.event;
    }
    if (e.pageX || e.pageY) {
        posx = e.pageX;
        posy = e.pageY;
    }
    else if (e.clientX || e.clientY) {
        posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    var rect = canvas.getBoundingClientRect();
    var x = rect.left + document.body.scrollLeft + document.documentElement.scrollLeft;
    var y = rect.top + document.body.scrollTop + document.documentElement.scrollTop;

    mx = posx - x;
    my = posy - y;

    onpress(mx, my);
}

/**
 * Called on mouse or touch press. Update and change state
 * depending on current game state.
 *
 * @param  {MouseEvent/TouchEvent} evt tho on press event
 */
function onpress(mx, my) {
//document.getElementById("consoleMe").innerHTML = evt.type;

    switch (currentstate) {

        // change state and update car velocity
        case states.Splash:
            currentstate = states.Game;
            bird.jump();
            break;

        case states.Junction:

            if (shuttlebtn.x < mx && mx < shuttlebtn.x + shuttlebtn.width && shuttlebtn.y < my && my < shuttlebtn.y + shuttlebtn.height) {
                //location.hash='share'
                if (junction_choice) {
                    if(score>3)score=score-4;
                    else {beep(); return;} 
                    Report_user_action(action_codes['shuttle_choice_ride'], stage - 1);
                    set_shuttle_performance();
                    shuttleChoice = true;
                    detourChoice = false;
                    junction_choice = false;
                    junction_shuttle_positioning = true;
                }
            }

            if (detourbtn.x < mx && mx < detourbtn.x + detourbtn.width && detourbtn.y < my && my < detourbtn.y + detourbtn.height) {
                //location.hash='share'
                if (junction_choice) {
                    Report_user_action(action_codes['shuttle_choice_detour'], stage - 1);
                    detourChoice = true;
                    shuttleChoice = false;
                    junction_choice = false;
                    junction_taking_detour1 = true;
                }

            }

            break;

            // update car velocity
        case states.Game:
            bird.jump();
            break;

            // change state if event within okbtn bounding box
        case states.Score:


            coins.reset();
            currentstate = states.Splash;
            break;

    }

}

/**
 * Starts and initiate the game
 */
function main() {
    // create canvas and set width/height
    canvas = document.createElement("canvas");

    canvas.setAttribute('id', 'gamecanvas');

    width = window.innerWidth;
    height = window.innerHeight;

    //var evt = "touchStart";
    if (width >= 500) {
        width = 320;
        height = 480;
        canvas.style.border = "1px solid #000";
        //evt = "mousedown";
    }

    // // prevent elastic scrolling
    // document.body.addEventListener('touchmove',function(event){
    //   event.preventDefault();
    // },false);	// end body:touchmove


    // listen for input event
    //document.addEventListener(evt, onpress);
    /*
     * 01/19/2015 Daniel F. Added event handler to canvas only.
     */
    canvas.addEventListener("touchstart", ontouch);
    canvas.addEventListener("mousedown", onmouse);

    canvas.width = width;
    canvas.height = height;
    scrollTextPos = width * 1.5;
    if (!(!!canvas.getContext && canvas.getContext("2d"))) {
        alert("Your browser doesn't support HTML5, please update to latest version");
    }
    ctx = canvas.getContext("2d");

    currentstate = states.Splash;

    // append canvas to document
    document.body.appendChild(canvas);

    FeedbackChart.init();


    // initate graphics and buttons
    var img = new Image();
    img.onload = function () {

        //Init the car and the rest of game sprites
        bird.init(this);
        initSprites(this);

        backgroundFx.update();

        okbtn = {
            x: (width - s_buttons.Ok.width) / 2,
            y: height - 200,
            width: s_buttons.Ok.width,
            height: s_buttons.Ok.height
        }

        sharebtn = {
            x: (width - s_buttons.Share.width) / 2,
            y: height - 150,
            width: s_buttons.Share.width,
            height: s_buttons.Share.height,
        }

        shuttlebtn = {
            x: 193, //(width - s_buttons.Shuttle.width)/2,
            y: 195, //height - 150,
            width: s_buttons.Shuttle.width,
            height: s_buttons.Shuttle.height,
        }

        detourbtn = {
            x: 193, //(width - s_buttons.Detour.width)/2,
            y: 375, //height - 150,
            width: s_buttons.Detour.width,
            height: s_buttons.Detour.height,
        }

        run();
    }

    var date = new Date;
    var hour = date.getHours();
    var month = date.getMonth();
    img.src = "./gamefiles/res/sheet52515.png";
}


function debugLog(txt) {
    if (window.location.hash) {
        document.getElementById("consoleMe").innerHTML = txt;
    }
}

/**
 * Starts and update gameloop
 */
function run() {
    loop();
}

/*
 * 1/19/2015 Took out the loop animation out of the run method 
 */
function loop()
{
    if (!isGamePaused) {
        update();
        render();
    }

    frameid = window.requestAnimationFrame(loop, canvas);

}

/**
 * Update foreground, car and coins position
 */
function update() {
    frames++;
    if (trial_time > 700 && coin_count > -1) {
        trial_time = 0;
        coin_count = 0;
        stage++;
        if (stage < 7) {
            currentstate = states.Junction;
            junction_before_choice = true;
            console.log("Time to get a new feedback data");
            //Calling json to get new data
            get_shuttle_stats();
        }
        else {
            report_score(score);
            reset_game_vars();
            stage = 1;
            hideGameCanvas();
        }
    }

    if (currentstate !== states.Score) {
        fgpos = (fgpos - 2) % 14;
    } else {
        // set best score to maximum score
        best = Math.max(best, score);
        try {
            localStorage.setItem("best", best);
        } catch (err) {
            //needed for safari private browsing mode
        }
        scrollTextPos = width * 1.5;
    }

    if (currentstate === states.Game) {
        coins.update();
    }

    bird.update();
    backgroundFx.update();
}

/**
 * Draws car and all assets to the canvas
 */
function render() {
    // draw background color
    ctx.fillRect(0, 0, width, height);

    // draw background sprites
    switch (stage) {
        case 1:
            s_bg.draw(ctx, 0, height - s_bg2.height);
            break;
        case 2:
            s_bg2.draw(ctx, 0, height - s_bg2.height);
            break;
        case 3:
            s_bg3.draw(ctx, 0, height - s_bg2.height);
            break;
        case 4:
            s_bg4.draw(ctx, 0, height - s_bg2.height);
            break;
        case 5:
            s_bg5.draw(ctx, 0, height - s_bg2.height);
            break;
        case 6:
            s_bg6.draw(ctx, 0, height - s_bg2.height);
            break;
    }

    coins.draw(ctx);

    // draw foreground sprites
    s_fg.draw(ctx, fgpos, height - s_fg.height + 100);
    s_fg.draw(ctx, fgpos + s_fg.width - 20, height - s_fg.height + 100);

    var width2 = width / 2; // center of canvas

    if (currentstate === states.Splash) {
        // draw splash text and sprite to canvas

        s_splash.draw(ctx, width2 - s_splash.width / 2, height - 300);
        s_text.GetReady.draw(ctx, width2 - s_text.GetReady.width / 2, height - 380);

        if (scrollTextPos < (0 - s_text.FlappyBird.width - width)) {
            scrollTextPos = width * 1.5;
        }

        scrollTextPos = scrollTextPos - 3;
        s_text.FlappyBird.draw(ctx, scrollTextPos, s_fg.height + 300);
    }






    /*
     // these are the state variables of the car around the lake: 
     junction_before_choice=false, // during this time the car will go to the junction
     junction_choice=false, // during this time the car waits at the junction
     junction_shuttle_positioning=false, // durign this time the car position itself on the dock after shuttle choice
     junction_wait_for_shuttle=false, // during this stage the care waits for the shuttle at the dock
     junction_taking_detour1=false, // the car takes the detour around the lake
     */


    if (currentstate === states.Game)
        trial_time++;

    if (currentstate === states.Junction) {

// first, take the car to the junction
        if (junction_before_choice) {
            if (bird_offset == 0)
                bird_offset = 100;  // this set the y offset of the car on the road
            if (bird_offset > 2)
                bird_offset -= 2; // lifting the car up, slowly toward the junction
            s_junction.drawX(ctx, 0, height - 500, x_offset, 0); // drawX = function(ctx, x, y, x_offset, y_offset)
            var w5 = width / 5;
            if (x_offset < w5)
                x_offset++;
            else { // we reached the junction!
                junction_before_choice = false;
                junction_choice = true;
                new_junction = true;
            }
        }

        if (junction_choice) { // the car is now at the junction, with car offset lifting it slightly until it reaches the right position waiting 

            s_junction.drawX(ctx, 0, height - 500, x_offset, 0); // we now draw the buttons of the 'shuttle' and 'detour' when the car is waiting:
            s_buttons.Detour.draw(ctx, detourbtn.x, detourbtn.y);
            if(score>3){ // user has enough money to pay for the shuttle
                s_buttons.Shuttle.draw(ctx, shuttlebtn.x, shuttlebtn.y);
                draw_stars(shuttle_feedback[0],shuttle_feedback[1],shuttle_feedback[2]); //,0,0);//
            }
            
            
            
            FeedbackChart.draw(ctx); // draw 'shuttle cost 4 coins

            if (new_junction) {
                //s_buttons.Shuttle.draw(ctx, shuttlebtn.x, shuttlebtn.y);
                new_junction = false;
                // here was the stars report
                
            }
            /*
             if(session===1)rnd=6;
             else rnd=Math.floor((Math.random() * 2) + 1);         
             switch(rnd)
             {
             case 1: s_buttons.Shuttle_1star.draw(ctx, shuttlebtn.x, shuttlebtn.y); break;
             case 2: s_buttons.Shuttle_2stars.draw(ctx, shuttlebtn.x, shuttlebtn.y); break;
             case 3: s_buttons.Shuttle_3stars.draw(ctx, shuttlebtn.x, shuttlebtn.y); break;
             case 4: s_buttons.Shuttle_4stars.draw(ctx, shuttlebtn.x, shuttlebtn.y); break;
             case 5: s_buttons.Shuttle_5stars.draw(ctx, shuttlebtn.x, shuttlebtn.y); break;
             case 6: s_buttons.Shuttle.draw(ctx, shuttlebtn.x, shuttlebtn.y); break;
             }
             */
        }



        if (shuttleChoice) {
            junction_choice = false;
            // we now deal with moving the car up, and the image right to place the care at the loading dock waiting spot
            if (junction_shuttle_positioning) {
                var w2 = width / 1.2;
                if (x_offset < w2) {
                    x_offset += 2;
                    bird.rotation = -0.4;
                    s_junction.drawX(ctx, 0, height - 500, x_offset, 0);
                    if (bird_offset > -190)
                        bird_offset -= 2;
                }
                else {
                    bird.rotation = 0;
                    junction_wait_for_shuttle = true;
                    junction_shuttle_positioning = false;
                }
            }


            if (junction_wait_for_shuttle) {
                shuttle_delay++;
                bird.rotation = 0;
                s_junction.drawX(ctx, 0, height - 500, x_offset, 0);
                // the shuttle has arrived  
                if (shuttle_delay > shuttle_wait) {
                    s_shuttle.draw(ctx, shuttle_retract + width2 * 1.8, height - 410);
                    /*
                    if (shuttle_speed === shuttle_speed_high)
                        s_shuttleX.draw(ctx, shuttle_retract + width2 * 1.8, height - 410);// shuttle_retract + 500+x_offset+width2 - s_splash.width/2+50, height - 410);
                    else if (shuttle_speed === shuttle_speed_low)
                        s_shuttleO.draw(ctx, shuttle_retract + width2 * 1.8, height - 410);
                    else
                        s_shuttle.draw(ctx, shuttle_retract + width2 * 1.8, height - 410);
               */
                    // reverse shuttle toward the car:  
                    if (shuttle_retract > -width / 1.4)
                        shuttle_retract -= shuttle_speed;
                    // cross the lake!
                    else if (shuttle_forward < width * 1.3) {
                        shuttle_forward += shuttle_speed;
                        x_offset += shuttle_speed;
                    }
                    else {
                        detourChoice = false;
                        shuttleChoice = false;
                        shuttle_forward = 0;
                        shuttle_retract = 0;
                        shuttle_delay = 0;
                        delays = false;
                        x_offset = 0;
                        second_x_offset = 0;
                        y_offset = 0;
                        bird.rotation = 0;
                        second_y_offset = 0;
                        bird_offset = 0;
                        junction_wait_for_shuttle = false;
                        currentstate = states.Game;
                        if (popup === 1){
                            showDialog();
                            //Report_user_action(99000+(10*performance_mem), 99000+client_score_mem- (session * 10));
                        }
                        else if (popup === 3 && first_pop) {
                            first_pop = false;
                            showDialog();
                        }
                        else if (popup === 2) {
                            every_other_pop++;
                            if (every_other_pop % 2)
                                showDialog();
                        }
                    }
                }
                else {
                    if (delays)
                        s_text_delays.draw(ctx, okbtn.x + 10, okbtn.y - 170);
                    else
                        s_buttons.Share.draw(ctx, okbtn.x + 10, okbtn.y - 170); // Share is wait...
                }
            }
        } // end shuttle choice



        if (detourChoice) {
            // first drive down     
            if (junction_taking_detour1) {
                bird.rotation = 0.5;
                s_junction.drawX(ctx, 0, 0, second_x_offset * 1.22, second_x_offset * 1.7);
                if (second_x_offset < 530)
                    second_x_offset += 1.6;// 3;
                else {
                    junction_taking_detour1 = false;
                    junction_taking_detour2 = true;
                }
            }

            // second part, flat
            if (junction_taking_detour2) {
                bird.rotation = 0;
                s_junction.drawX(ctx, 0, 0, second_x_offset * 1.22, 900);
                if (second_x_offset < 800)
                    second_x_offset += 1.5;
                else {
                    y_offset = 0;
                    junction_taking_detour2 = false;
                    junction_taking_detour3 = true;
                }
            }

            // last drive up 
            if (junction_taking_detour3) {
                bird.rotation = -0.9;
                s_junction.drawX(ctx, 0, 0, second_x_offset * 1.22, 900 - y_offset);
                if (y_offset < 816)
                    y_offset += 3;//1.6;
                else { // reset vars
                    junction_taking_detour3 = false;
                    detourChoice = false;
                    shuttleChoice = false;
                    x_offset = 0;
                    second_x_offset = 0;
                    y_offset = 0;
                    bird.rotation = 0;
                    second_y_offset = 0;
                    bird_offset = 0;
                    i = 0;
                    currentstate = states.Game;
                }   // end reset vars
            }  // end last drive up
        } // end detour choice	
    } // end currentstate === states.Junction


    if (currentstate === states.Score) {
        // draw gameover text and score board
        s_text.GameOver.draw(ctx, width2 - s_text.GameOver.width / 2, height - 400);
        s_score.draw(ctx, width2 - s_score.width / 2, height - 340);
        s_buttons.Ok.draw(ctx, okbtn.x, okbtn.y);
        s_buttons.Share.draw(ctx, sharebtn.x, sharebtn.y);

        // draw score and best inside the score board
        s_numberS.draw(ctx, width2 - 47, height - 304, score, null, 10);
        s_numberS.draw(ctx, width2 - 47, height - 262, best, null, 10);

    } else {
        // draw score to top of canvas
        //if (currentstate != states.Junction)
            s_numberB.draw(ctx, null, 20, score, width2);
    }
    bird.draw(ctx);
}






function Report_user_action(user_choice, game_state) // choice will return 1 for shuttle and 2 for detour
{
    var state2 = (session * 10) + game_state;
    var client = new XMLHttpRequest();
    var postdata = "action=" + encodeURIComponent(unescape(user_choice)) + "&state=" + encodeURIComponent(unescape(state2));
    client.open("POST", "./u311/carexperiment/ctrl/saveClickData.php");
    client.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    client.send(postdata);
}


function report_score(score)
{
    var client = new XMLHttpRequest();
    var postdata = "score=" + encodeURIComponent(unescape(score));
    client.open("POST", "./u311/carexperiment/ctrl/registerScore.php");
    client.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
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
   */  
}



// start and run the game
window.onload = function () {
    main();
};

function hideGameCanvas()
{
    window.location.href = ServerStateVars.survey_url;
}


function showGameCanvas()
{
    isGamePaused = false;
    var canvas = document.getElementById("gamecanvas");
    var form = document.getElementById("survey_form");
    form.style.display = 'none';
    canvas.style.display = 'block';

    return false;
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
            var scr=Math.round(shuttle_feedback[0])+Math.round(shuttle_feedback[1])*10+Math.round(shuttle_feedback[2])*100;
            scr=scr+7000;//+shuttle_feedback[0]+(shuttle_feedback[1]*10)+(shuttle_feedback[2]*100);
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

           performance_duration = ((-25) * feedbacks_num + 22) / 2; // good performance
          // performance_duration = ((-28) * feedbacks_num + 29) / 2; // bad performance
            if(feedbacks_corr!==-99) {
                performance_duration+=feedbacks_corr*10; // note that correlation between duration and score should be negative, reducing duration
                performance_duration+=3; // a panalty so that only correlation above 0.3 will help.
                Report_user_action(8500+(100*feedbacks_corr), stage - 1);
            }
            if(performance_duration<0){performance_duration=0;}
            Report_user_action(8000+performance_duration, stage - 1);
            performance_mem=performance_duration;
            shuttle_wait = performance_duration * 60;
            shuttle_speed = -0.112 * performance_duration + 2.455;
            if (shuttle_speed < 0.3)
                shuttle_speed = 0.3;
            
        }
    }
}


function draw_stars(x,y,z)
{
    if(show_feedback===false)return;
    offset=52;//32;//52;
    if(x){
        for(i=0;i<5;i++){
            if(i<x) s_star.draw(ctx,shuttlebtn.x+offset+14*i, shuttlebtn.y+40);//60);//40);
            else s_gray_star.draw(ctx,shuttlebtn.x+offset+14*i, shuttlebtn.y+40);//60);//+40);
        }
    }
    
    if(y){
        for(i=0;i<5;i++){
            if(i<y) s_star.draw(ctx,shuttlebtn.x+offset+14*i, shuttlebtn.y+54);
            else s_gray_star.draw(ctx,shuttlebtn.x+offset+14*i, shuttlebtn.y+54);
        }
    }
    
    if(z){
        for(i=0;i<5;i++){
            if(i<z) s_star.draw(ctx,shuttlebtn.x+offset+14*i, shuttlebtn.y+68);
            else s_gray_star.draw(ctx,shuttlebtn.x+offset+14*i, shuttlebtn.y+68);
        }
    }
    
}