/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
//var client_score_mem=8;
var dialog1_done=false;
var dialog2_done=false;
var score1;
var score2;

function btnClickHandler()
{
    var client = new XMLHttpRequest();
    var postdata= "action=1&state=1";
    
    
    client.open("POST", "./u311/carexperiment/ctrl/saveClickData.php");
    client.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
        
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
    dialog.style.left = ((w - dialog.offsetWidth) / 2)+"px";
    dialog.style.top = ((h - dialog.offsetHeight) / 2)+"px";
    
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
    
    //alert('popup'+popup);
    if(client_score===-999) // user decided to bail out...
    {
        overide=true;
        var yyy=false;
        var client = new XMLHttpRequest();
        var postdata = "popup=" + encodeURIComponent(unescape(yyy));
        client.open("POST", "./u311/carexperiment/ctrl/setShowPopup.php");
        client.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
        client.send(postdata);  
        popup = false;
        var dialog = document.getElementById("rating_dialog");
        dialog.style.display = "none";
        isGamePaused = false; 
        dialog1_done=dialog2_done=false;
    }
    else{
          score1=client_score;
          dialog1_done=true;
    }
    
    if(dialog1_done && dialog2_done)
    {
        var state2 = (session * 10);
        var client = new XMLHttpRequest();
        var postdata = "action=" + encodeURIComponent(unescape((score1+score2)/2.0)) + "&state=" + encodeURIComponent(unescape(state2));
        client.open("POST", "./u311/carexperiment/ctrl/saveClickData.php");
        client.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        client.send(postdata);
        
        Report_user_action(99000+(10*performance_mem), 99000 + (score1+score2)/2.0 - (session * 10));
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
        dialog1_done=dialog2_done=false; 
    }
    
}


function saveRatingDialog2(client_score)
{
   
    
    score2=client_score;
    dialog2_done=true;
    
    if(dialog1_done && dialog2_done)
    {
        var state2 = (session * 10);
        var client = new XMLHttpRequest();
        var postdata = "action=" + encodeURIComponent(unescape((score1+score2)/2.0)) + "&state=" + encodeURIComponent(unescape(state2));
        client.open("POST", "./u311/carexperiment/ctrl/saveClickData.php");
        client.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        client.send(postdata);
        
        Report_user_action(99000+(10*performance_mem), 99000 + (score1+score2)/2.0 - (session * 10));
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
        dialog1_done=dialog2_done=false; 
    }
    
}

