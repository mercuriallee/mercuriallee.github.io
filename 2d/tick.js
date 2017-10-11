var ctx = document.getElementById('canvas').getContext('2d');
var img = document.getElementById('img');

var draw = function(load) {
    var angle = 0.01;
    ctx.clearRect(0,0,400,400);
    ctx.save();
    ctx.translate(200,200);
    for (var i=0; i<load; i++) {
        ctx.rotate(angle);
        ctx.drawImage(img, 0, 0, 50, 50);
    }
    ctx.restore();
};

var t, previousTime;
var drawLoad = 1;
var slowCount = 0;
var maxSlow = 10;

t = previousTime = +new Date;

var tick = function() {
    var maximumFrameTime = 1000/30; // 30 FPS
    t = +new Date;
    var elapsed = t - previousTime;
    previousTime = t;
    if (elapsed < maximumFrameTime || slowCount < maxSlow) {
        if (elapsed < maximumFrameTime) {
            drawLoad+=10;
        } else {
            slowCount++;
        }
        draw(drawLoad);
        requestAnimationFrame(tick);
    } else {
      // found maximum sustainable load at 30 FPS
      document.getElementById('res').innerHTML = ("could draw "+(drawLoad)+" in " + maximumFrameTime + " ms");
    }
};

function resetTick() {
	drowLoad = 1;
	slowCount = 0;
}
