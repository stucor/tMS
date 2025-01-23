

var currentAudio = new Audio();

var playingAudioDetail = [[]];

var isplaying = false;

//var currentfile;
var currentaudiosourceindex = 0;
var currentdetailindex = 0;

// The Text
var navigationtext = document.getElementById("navigation-text");
var paratext = document.getElementById("para-text");
var messagetext = document.getElementById("message-text");

// The Buttons
var prevParaButton = document.getElementById('prev-para-button');
var nextParaButton = document.getElementById('next-para-button');
var playPauseButton = document.getElementById('play-pause-button');
var prevChapButton = document.getElementById('prev-chap-button');
var nextChapButton = document.getElementById('next-chap-button');
var speedButton = document.getElementById('speed-button');
var volDownButton = document.getElementById('vol-down');
var volUpButton = document.getElementById('vol-up');

//The Visualisation
var context;
var src;
var analyser;
var firstPlay = true;
var playerVisualisationColor = "#9db4ff75";

function initVisualisation() {
    context = new AudioContext();
    src = context.createMediaElementSource(currentAudio);
    analyser = context.createAnalyser();

    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    
    src.connect(analyser);
    analyser.connect(context.destination);
    
    analyser.fftSize = 256;
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);
    var WIDTH = canvas.width;
    var HEIGHT = canvas.height;
    var barWidth = (WIDTH / bufferLength) * 2.5;
    var barHeight;
    var x = 0;
    
    renderFrame();

    function renderFrame() {
      requestAnimationFrame(renderFrame);
      x = 0;
      analyser.getByteFrequencyData(dataArray);
    
      var customfillstyle = getComputedStyle(document.body).getPropertyValue('--canvasbackground');
      ctx.fillStyle = customfillstyle;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
      for (var i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];
        
/*
        var r = barHeight + (25 * (i/bufferLength));
        var g = 250 * (i/bufferLength);
        var b = 500;
        ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ",0.25)";
*/
        ctx.fillStyle = playerVisualisationColor;
        ctx.fillRect(x, (HEIGHT - barHeight*0.5), barWidth, barHeight);
        x += barWidth + 1;
      }
    }

}

//INITIALISATION
function initplayer () {
    loadnewaudio(currentaudiosourceindex, currentdetailindex);
    if ((currentaudiosourceindex == 0) && (currentdetailindex == 0)) {
        navigationtext.innerHTML = "Start of Book";
        paratext.innerHTML = "Press Play";
    } else {
        navigationtext.innerHTML = playingAudioDetail[currentdetailindex][1];
        paratext.innerHTML = playingAudioDetail[currentdetailindex][2];
    }
}



var timeleftinchapter = document.getElementById('time-left-chap');
var timeleft;
var s, m, h;

var chaptertimeadjust = 0;
var firstloadbeforenav = true;

function filltimeleftinchapter () {
    if (firstloadbeforenav) {
        timeleft= 0;
        firstloadbeforenav = false;
    } else {
        timeleft = parseInt(currentAudio.duration) - parseInt(currentAudio.currentTime) + chaptertimeadjust;
    }
    s = timeleft % 60;
    m = Math.floor( timeleft / 60 ) % 60;
    h = Math.floor( timeleft / 60 /60 ) % 60;
    
    s = s < 10 ? "0"+s : s;
    m = m < 10 ? "0"+m : m;
    if (!isNaN(s)) {
        timeleftinchapter.innerHTML = h+":"+m+":"+s;
    }
}

function navtimeupdate () {
    for (let i = 0; i < playingAudioDetail.length; i++) {
            if (parseFloat(currentAudio.currentTime).toFixed(1) >= playingAudioDetail[i][0]) {
                navigationtext.innerHTML = playingAudioDetail[i][1];
                paratext.innerHTML = playingAudioDetail[i][2];
                chaptertimeadjust = playingAudioDetail[i][4]
                currentdetailindex = i;
            }
    }
    filltimeleftinchapter(parseInt(currentAudio.duration));
}

function clearmessage() {
    messagetext.innerHTML = ""; 
    messagetext.style.backgroundColor = "#ffffff00";
    messagetext.style.border = "unset";
}

function message (messagetosend) {
    messagetext.innerHTML = messagetosend;
    messagetext.style.backgroundColor = "crimson";
    messagetext.style.border = "1px solid #7c1126";
    setTimeout(function () { clearmessage() }, 3000);
}    

// loading new files
function carryOn () {
    if ( currentaudiosourceindex < allAudioSrc.length-1) {
        loadnewaudio (currentaudiosourceindex +1);
        currentAudio.play(); 
    } else {
        message ("end of book");
    }    
}
function loadnewaudio (audioIndexToLoad, playfromwhere = 0) {
    var detailArrayName = 'audioDetail_' + audioIndexToLoad; 
    var currentspeed = currentAudio.playbackRate;
    currentaudiosourceindex = audioIndexToLoad;
    currentAudio.src = allAudioSrc[audioIndexToLoad];
    playingAudioDetail = window[detailArrayName];
    currentAudio.currentTime = playingAudioDetail[playfromwhere][0];
    currentAudio.playbackRate = currentspeed;
}
function playthis (fileindex, paragraphindex) {
    if (currentaudiosourceindex != fileindex) {
        loadnewaudio(fileindex);
    }
    currentAudio.currentTime = playingAudioDetail[paragraphindex][0];
    if (isplaying) {
        currentAudio.play();
    }
}

// Audio events
currentAudio.addEventListener("timeupdate", navtimeupdate);
currentAudio.addEventListener("ended", carryOn);
currentAudio.addEventListener("play", function() {
    isplaying = true; 
    playPauseButton.classList.add("pausebtn");
});
currentAudio.addEventListener("pause", function() {
    isplaying = false;
    playPauseButton.classList.remove("pausebtn");
});
currentAudio.addEventListener("ratechange", function() {
    speedButton.innerHTML = "X"+currentAudio.playbackRate;
});
currentAudio.addEventListener("canplay", function() {
    filltimeleftinchapter();
});


function issplitpara (currentasi, newasi) {
    var currentparadetails = "current";
    var newparadetails = "new";

    if (currentasi < newasi) { //checking next
        //console.log ("in a");
        var currentdetailarrayname = window['audioDetail_' + currentasi];
        var newdetailarrayname = window['audioDetail_' + (newasi)];

        currentparadetails = currentdetailarrayname[currentdetailarrayname.length-1][1] + currentdetailarrayname[currentdetailarrayname.length-1][2]+currentdetailarrayname[currentdetailarrayname.length-1][3];
        newparadetails = newdetailarrayname[0][1] + newdetailarrayname[0][2] + newdetailarrayname[0][3];
    } else { //checking previous
        //console.log ("in b");

        var currentdetailarrayname = window['audioDetail_' + currentasi];
        var newdetailarrayname = window['audioDetail_' + (newasi)];

        currentparadetails = currentdetailarrayname[0][1] + currentdetailarrayname[0][2]+currentdetailarrayname[0][3];
        newparadetails = newdetailarrayname[newdetailarrayname.length-1][1] + newdetailarrayname[newdetailarrayname.length-1][2] + newdetailarrayname[newdetailarrayname.length-1][3];
    }
    if (currentparadetails == newparadetails) {
        return true;
    } else {
        return false;
    }
}

function doPrevPara () {
    var gotopara = currentdetailindex;
    clearmessage();
    if ((currentAudio.currentTime) > ((playingAudioDetail[currentdetailindex][0])+2)) {
        if ((gotopara == 0) && (currentaudiosourceindex > 0)) { //check if paragraph starts in previous file
            if (issplitpara(currentaudiosourceindex, currentaudiosourceindex-1)) {
                loadnewaudio (currentaudiosourceindex-1);
                currentdetailindex = playingAudioDetail.length-1;
            }
        }
        currentAudio.currentTime = playingAudioDetail[currentdetailindex][0];
    } else {    
        if (gotopara > 0) {
            gotopara = gotopara - 1;

            if ((gotopara == 0) && (currentaudiosourceindex > 0)) { //check if paragraph starts in previous file
                if (issplitpara(currentaudiosourceindex, currentaudiosourceindex-1)) {
                    loadnewaudio (currentaudiosourceindex-1);
                    gotopara = playingAudioDetail.length-1;
                }
            }
            currentAudio.currentTime = playingAudioDetail[gotopara][0];
        }  else {
            if (currentaudiosourceindex > 0) {
                loadnewaudio (currentaudiosourceindex-1);
                currentdetailindex = playingAudioDetail.length-1;
                currentAudio.currentTime = playingAudioDetail[currentdetailindex][0];
            } else {
                message ("At first paragraph");
            }
        }
    }
    if (isplaying) {
        currentAudio.play();
    }
}
function doNextPara () {    
    var gotopara = currentdetailindex;
    clearmessage();
    if (gotopara < playingAudioDetail.length-1) {
        gotopara = gotopara + 1;
        currentAudio.currentTime = playingAudioDetail[gotopara][0];
    }  else {
        if (currentaudiosourceindex < allAudioSrc.length-1) {
            if (issplitpara (currentaudiosourceindex, currentaudiosourceindex+1)) {
                loadnewaudio (currentaudiosourceindex+1, 1);
            } else {
                loadnewaudio (currentaudiosourceindex+1);
            }
            if (isplaying) {
                currentAudio.play();
            }
        } else {    
            message ("At last paragraph");
        }
    }
}
function doPlayPause () {
    clearmessage();
    if (isplaying) {
        currentAudio.pause();
    } else {
        currentAudio.play();
        if (firstPlay) {
            initVisualisation();
            firstPlay = false;
        }
    }
}
function doPrevChap () {
    var currentchapterindex = playingAudioDetail[currentdetailindex][3];
    clearmessage();
    if (currentchapterindex == 0) {
        message("At first Chapter");
        currentAudio.currentTime = 0;
        return 0;
    } else {
        var potnewdetailarray = allchapters[currentchapterindex][1];
        if ((allchapters[currentchapterindex][2] == currentdetailindex) && (currentAudio.currentTime < (playingAudioDetail[currentdetailindex][0] + 2))) {
            currentchapterindex = currentchapterindex-1;
            potnewdetailarray = allchapters[currentchapterindex][1];
        }
        if (potnewdetailarray != currentaudiosourceindex) {
            loadnewaudio (potnewdetailarray);
        }
        currentAudio.currentTime = playingAudioDetail[allchapters[currentchapterindex][2]][0];
    }
    if (isplaying) {
        currentAudio.play();
    }
}
function doNextChap () {
    var currentchapterindex = playingAudioDetail[currentdetailindex][3];
    clearmessage();
    if (currentchapterindex == allchapters.length -1) {
        message("At last Chapter");
        return 0;
    } else {
        currentchapterindex = currentchapterindex + 1;
        var potnewdetailarray = allchapters[currentchapterindex][1];
        if (potnewdetailarray != currentaudiosourceindex) {
            loadnewaudio (potnewdetailarray);
        }
        currentAudio.currentTime = playingAudioDetail[allchapters[currentchapterindex][2]][0];
    }
    if (isplaying) {
        currentAudio.play();
    }  
}
function doSpeed () {
    var currentspeed = currentAudio.playbackRate;
    clearmessage();
    switch (currentspeed) {
    case 1: {
        currentAudio.playbackRate = 1.5;
        break; }
    case 1.5: {
    currentAudio.playbackRate = 2;
        break; }
     case 2: {
    currentAudio.playbackRate = 0.7;
        break; }
    case 0.7: {
    currentAudio.playbackRate = 1;
        break; }
    }
}
// Button clicks
prevParaButton.addEventListener("click", function() {doPrevPara();});
nextParaButton.addEventListener("click", function() {doNextPara();});
playPauseButton.addEventListener("click", function(){doPlayPause();});
prevChapButton.addEventListener("click", function() {doPrevChap();});
nextChapButton.addEventListener("click", function() {doNextChap();});
speedButton.addEventListener("click", function() {doSpeed();});
volUpButton.addEventListener("click", function() {doVolUp();});
volDownButton.addEventListener("click", function() {doVolDown();});

// Volume Slider (incl scroll wheel)
var volslider = document.getElementById("volRange");
volslider.addEventListener("input", function() {
    currentAudio.volume = this.value / 100; 
    var value = (this.value-this.min)/(this.max-this.min)*100;
    this.style.background = 'linear-gradient(to right, var(--audiobuttoncolor) 0%, var(--audiobuttoncolor) ' + value + '%, #ffffff00 ' + value + '%, #ffffff00 100%)';
});
function doVolUp () {
    if (currentAudio.volume < 1) {
        var newval = ((currentAudio.volume * 10) + 1) /10;
        if (newval > 1) { 
            newval = 1; 
        };
        currentAudio.volume = newval;
        volslider.value = newval *100;
        slide.trigger('change');
    } else {
        message("At Maximum Volume");
    }
}
function doVolDown () {
    if (currentAudio.volume > 0.01) {
        var newval = ((currentAudio.volume * 10) - 1) /10;
        if (newval < 0) { 
            newval = 0;
        };
        currentAudio.volume = newval;
        volslider.value = newval *100;
        slide.trigger('change');
    } else {
        message("At Minimum Volume");
    }
}

// Keyboard Shortcuts
window.addEventListener("keydown", function (event) {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }
    switch (event.key) {
    case "ArrowDown":
        doNextPara();
        break;
    case "ArrowUp":
        doPrevPara();
        break;
    case "ArrowLeft":
        doPrevChap();
        break;
    case "ArrowRight":
        doNextChap();
        break;
    case " ":
        doPlayPause();
        break;
    case ("s" || "S"):
        doSpeed();
        break;
    case ("V"):
        doVolUp();
        break;
    case ("v"):
        doVolDown()
        break;
    default:
        return;
    }
    event.preventDefault(); // Cancel the default action to avoid it being handled twice
}, true);

/* From Internet - uses JQuery */
var slide = $("#volRange");
var mousewheelevt = "wheel"; 
// detect slider change and change the image size
slide.on('change',function () {
    currentAudio.volume = this.value / 100;
    var value = (this.value-this.min)/(this.max-this.min)*100;
    this.style.background = 'linear-gradient(to right, var(--audiobuttoncolor) 0%, var(--audiobuttoncolor) ' + value + '%, #ffffff00 ' + value + '%, #ffffff00 100%)';
    if (currentAudio.volume <= 0.01) {
        currentAudio.muted = true;
        document.getElementById("vol-mute").classList.remove("noshow");
        document.getElementById("vol-down").classList.add("noshow");
    } else {
        currentAudio.muted = false;
        document.getElementById("vol-mute").classList.add("noshow");
        document.getElementById("vol-down").classList.remove("noshow");       
    } 
});
// active mouse scroll when mouse is over element
slide.on('mouseover', function(){
  slide.bind(mousewheelevt, moveSlider);
});
// move the slider based on scrolling
function moveSlider(e){
    var zoomLevel = parseInt(slide.val()); 
    
    // detect positive or negative scrolling
    if ( e.originalEvent.wheelDelta < 0 ) {
      //scroll down
			slide.val(zoomLevel-1);
    } else {
      //scroll up
			slide.val(zoomLevel+1);
    }
    
    // trigger the change event
    slide.trigger('change');
    
    //prevent page fom scrolling
    return false;
}
