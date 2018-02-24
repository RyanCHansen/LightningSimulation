
var orbsThatHaveBeenHit = [9];
var totalStrikes = 0;
var totalJumps = 0;
var strikePath = [];


function Animation(spriteSheet, frameWidth, frameHeight, sheetWidth,
                     frameDuration, frames, loop, scale) {
    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.sheetWidth = sheetWidth;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.scale = scale;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y) {
    this.elapsedTime += tick;
    if (this.isDone()) {
        if (this.loop) this.elapsedTime = 0;
    }
    var frame = this.currentFrame();
    var xindex = 0;
    var yindex = 0;
    xindex = frame % this.sheetWidth;
    yindex = Math.floor(frame / this.sheetWidth);

    ctx.drawImage(this.spriteSheet,
                 xindex * this.frameWidth, yindex * this.frameHeight,  // source from sheet
                 this.frameWidth, this.frameHeight,
                 x, y,
                 this.frameWidth * this.scale,
                 this.frameHeight * this.scale);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}



function Background(game, spritesheet) {
    this.x = 0;
    this.y = 0;
    this.speed = 0;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
    this.gameOver = true;
    this.gameStart = true;
}

Background.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet, this.x, this.y);
    this.ctx.font="15px Georgia";
    this.color = this.color = "hsl(120, 80%, 60%)";;
    this.ctx.fillStyle=this.color;
    this.ctx.fillText("Strikes: "+totalStrikes+"     Jumps: "+totalJumps,300,740);

    //all of this only appears the first time the page is loaded
    //to let the person know the rules of the game
    if (this.gameStart == true) {
        this.ctx.font="40px Georgia";
        this.color = this.color = "hsl(120, 80%, 60%)";
        this.ctx.fillStyle=this.color;
        this.ctx.fillText("Click to Start",257,670);

        this.ctx.font="20px Georgia";
        this.ctx.fillText("Orbs 25%+ full adds 1 Jump",250,115);
        this.ctx.fillText("Orbs 50%+ full adds 2 Jumps",250,190);
        this.ctx.fillText("Orbs 75%+ full adds 3 Jumps",250,263);

        this.game.entities[13].fullness = .5;
        this.game.entities[23].fullness = 1.0;
        this.game.entities[33].fullness = 1.5;
        this.game.entities[18].fullness = .5;
        this.game.entities[28].fullness = 1.0;
        this.game.entities[38].fullness = 1.5;

        this.ctx.fillText("-Lightning cannot jump to the same orb",198,350);
        this.ctx.fillText("twice in a single strike",270,380);

        this.ctx.fillText("-Strike on red orb ends simulation",220,430);

        this.ctx.fillText("-Strike on orbs adds 25% energy",227,480);

        this.ctx.fillText("-Energy slowly drains",270,530);
    }
}

Background.prototype.update = function () {

    //used for resetting the game when its over
    if (this.game.click && this.gameOver == true) {

        this.game.click = false;

        totalStrikes = 0;
        totalJumps = 0;
        this.game.entities[10].lightningTimer = 100;
        this.gameOver = false;
        this.gameStart = false;

        for (var i = 1; i < 101; i++){
            this.game.entities[i].fullness = .001;
        }
    } else {
        this.game.click = false;
    }
}


//winner winner chicken dinner!
function WWCD(game, spritesheet) {
    this.x = 75;
    this.y = 75;
    this.speed = 0;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
    this.removeTimer = 50;
}

WWCD.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet, this.x, this.y);
    this.ctx.font="40px Georgia";
    this.color = this.color = "hsl(120, 80%, 60%)";
    this.ctx.fillStyle=this.color;
    this.ctx.fillText("Total Lightning Jumps: "+totalJumps,125,80);
    this.ctx.fillText("Click to Restart",240,690);
}

//set to remove after a short interval and reapear
WWCD.prototype.update = function () {
    this.removeTimer--;
    if (this.removeTimer == 0) {
        this.game.removeEntity(this);
    }
}


function Lightning(game, sX, sY, eX, eY, strikes) {
    this.ctx = game.ctx;
    this.x = sX;
    this.y = sY;
    this.endX = eX;
    this.endY = eY;
    this.fade = 1.0;
    this.bolts = getDemBolts(this.x, this.y, this.endX, this.endY);
    Entity.call(this, game, sX, sY);
}

Lightning.prototype = new Entity();
Lightning.prototype.constructor = Lightning;

Lightning.prototype.draw = function () {
    this.color = "hsla(180, 80%, 80%, "+ this.fade +")";
    this.ctx.shadowColor = this.color;
    this.ctx.shadowBlur = 10;
    //this.ctx.globalCompositeOperation = "lighter";
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = 3;

    this.ctx.beginPath();
    //this.ctx.moveTo(this.x, this.y);
    //this.ctx.lineTo(this.endX, this.endY);
    for (var i = 0; i < this.bolts.length; i++) {
        this.ctx.lineTo(this.bolts[i].x, this.bolts[i].y);   
    }
    this.ctx.stroke();
}

Lightning.prototype.update = function () {
    this.fade -= 0.03;
    //console.log(this.fade);
    if (this.fade <= 0.0) {
        this.game.removeEntity(this);
    }
}

//called to turn the straight line between two points
//into a 'lightning bolt'
function getDemBolts(startX, startY, endX, endY) {
    var bolts = [];
    var minSegmentLength = 7;
    var a = startX - endX;
    var b = startY - endY;
    var segmentLength = Math.ceil(Math.sqrt( a*a + b*b ));
    var roughness = 1.4;
    var currDiff = segmentLength / 10;

    bolts.push({x: startX, y: startY});
    bolts.push({x: endX, y: endY});

    //used for testing/tweeking the bolts 
    // console.log("a: "+a);
    // console.log("b: "+b);
    // console.log("segmentLength: "+segmentLength);
    // console.log("currDiff: "+currDiff);
    // console.log("roughness: "+roughness);

    //will keep going until the segments are the minimum length
    //pushing the new line pieces into a new array
    while (segmentLength > minSegmentLength) {
        var newSegments = [];
        for (var i = 0; i < bolts.length - 1; i++) {
            var start = bolts[i];
            var end = bolts[i + 1];
            var midX = (start.x + end.x) / 2;
            var midY = (start.y + end.y) / 2;

            var newX = midX + (Math.random() * 2 - 1) * currDiff;
            var newY = midY + (Math.random() * 2 - 1) * currDiff;
            newSegments.push(start, {x: newX, y: newY});

        }
        newSegments.push(bolts.pop());
        bolts = newSegments;
        currDiff /= roughness;
        segmentLength /= 2;
    }
    return bolts;
}


//generate random lightning bolts
// setInterval(function() {
//     var sx2 = 710; //Math.floor(Math.random() * 700) +1 ;
//     var sy2 = 40; //Math.floor(Math.random() * 700) +1 ;
//     //var ex2 = 635;
//     //var ey2 = 115;
//     var ex2 = Math.floor(Math.random() * 700) +1 ;
//     var ey2 = Math.floor(Math.random() * 700) +1 ;
//     gameEngine.addEntity(new Lightning(gameEngine, sx2, sy2, ex2, ey2));
// }, 500)



function Orb(game, sX, sY, orbNum) {
    this.ctx = game.ctx;
    this.game = game;
    this.x = sX;
    this.y = sY;
    this.fullness = 0.001;
    this.speed = .15;
    this.orbNumber = orbNum;
    this.neighborOrbs = [];
    this.description = "orb: " +this.orbNumber;
    this.startingLineOrb = false;
    this.finishLineOrb = false;
    this.lightningTimer = 100;
    this.endGameLightningTimer = 100;
    this.hitByLightning = false;
    this.numberOfStrikesLeft = 0;
    this.strikesLeft = 0;

    Entity.call(this, game, sX, sY);
}

Orb.prototype = new Entity();
Orb.prototype.constructor = Orb;

Orb.prototype.draw = function () {
    if (this.orbNumber == '9') {
        this.color = "hsl(200, 80%, 60%";
    } else if (this.orbNumber == '90') {
        this.color = "hsl(0, 100%, 40%)";
    } else {
        this.color = "hsl(120, 80%, 20%)";
    }
    this.ctx.shadowColor = this.color;
    this.ctx.strokeStyle = this.color;
    this.ctx.shadowBlur = 10;
    this.ctx.globalCompositeOperation = "lighter";

    //used to draw a thinner line for empty orbs
    if (this.startingLineOrb == true || this.finishLineOrb == true) {
        this.ctx.lineWidth = 5;
    } else {
        this.ctx.lineWidth = .5;
    }
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, 10, 0, (Math.PI * 2), false);
    this.ctx.stroke();

    //pickes the intensity of green depending on 
    //the fullness of the orb at the time
    if (this.fullness >= 0.5 && this.fullness < 1.0) {
        this.color = "hsl(120, 80%, 35%)";
    } else if (this.fullness >= 1.0 && this.fullness < 1.5) {
        this.color = "hsl(120, 80%, 60%)";
    } else if (this.fullness >= 1.5) {
        this.color = "hsl(120, 80%, 75%)";
    }
    this.ctx.shadowColor = this.color;
    this.ctx.strokeStyle = this.color;

    //actual part which draws the 'timer' 
    //portion of the orb
    if (this.orbNumber != 9 && this.orbNumber != 90) {
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, 10, 0, (Math.PI * this.fullness), false);
        this.ctx.stroke();
    }

    // //just shows the orbNumber above it for
    // //debugging purposes
    // this.color = "hsl(60, 100%, 50%)";
    // this.ctx.shadowColor = this.color;
    // this.ctx.strokeStyle = this.color;
    // this.ctx.shadowBlur = 1;
    // this.ctx.font = "15px Arial";
    // this.ctx.fillText(""+this.orbNumber,this.x-7,this.y-11);
}

Orb.prototype.update = function () {

    //this is the logic which determines if the lightning should keep going
    //after hitting a new orb
    if (this.strikesLeft > 0) {
        var startX = this.x;
        var startY = this.y; 
        var tempNeighbors = this.neighborOrbs.slice();
        
        while (tempNeighbors.length != 0) {
            var tempNumber = (Math.floor(Math.random() * tempNeighbors.length));
            var pickedOrb = tempNeighbors[tempNumber];
            if (orbsThatHaveBeenHit.includes(pickedOrb.orbNumber)) {
                tempNeighbors.splice(tempNumber, 1);
                continue;
            } else {
                break;
            }
        } 

        //only picks the next orb to jump to if there is a neighbor orb
        //which hasn't already been hit this turn
        if (tempNeighbors.length != 0) {
            var endX = pickedOrb.x;
            var endY = pickedOrb.y;
            gameEngine.addEntity(new Lightning(gameEngine, startX, startY, endX, endY));
            strikePath.push(pickedOrb);
            totalJumps++;
            pickedOrb.hitByLightning = true;
            pickedOrb.strikesLeft = this.strikesLeft - 1;

            //if orb is between 25%-49% full, add 1 strike
            if (pickedOrb.fullness >= 0.5 && pickedOrb.fullness < 1.0) { 
                pickedOrb.strikesLeft = pickedOrb.strikesLeft + 1;
            //if orb is 50%-74%, add 2 strikes
            } else if (pickedOrb.fullness >= 1.0 && pickedOrb.fullness < 1.5) {
                pickedOrb.strikesLeft = pickedOrb.strikesLeft + 2;
            //if orb is 75%-100%, add 3 strikes
            } else if (pickedOrb.fullness >= 1.5) {
                pickedOrb.strikesLeft = pickedOrb.strikesLeft + 3;
            }

            orbsThatHaveBeenHit.push(pickedOrb.orbNumber);
            this.strikesLeft = 0;

            //if the red orb was hit, end the simulation
            if (pickedOrb.orbNumber == 90) {
                this.game.entities[10].lightningTimer = -1;
                pickedOrb.strikesLeft = 0;
            }
        } else {
            this.strikesLeft = 0;
        }
    }

    //if this orb is hit by lightning, add 25% energy
    if (this.hitByLightning == true) {
        this.fullness += 0.5;
        this.hitByLightning = false;
        //keeps the orbs from overfilling with energy
        if (this.fullness > 2.0) {
            this.fullness = 2.0;
        }
    }

    //uses the game clock to slowly drain the orbs energy level
    if (this.fullness > 0.001) {
        this.fullness -= this.game.clockTick * this.speed;
        //keeps the orb from showing 'full' when it is
        //really 'empty'
        if (this.fullness < 0) {
            this.fullness = 0.001;
        }
    } 

    //this is where the first lightning strike is started from orb 9
    //generates a bolt of lightning at the rate of lightning timer.
    if (this.startingLineOrb == true && this.lightningTimer == 0
                                     && this.game.entities[0].gameOver == false) {
        //console.log("new strike");

        //clears the array of hit orbs except for the starting orb
        orbsThatHaveBeenHit = [9];

        //clears the last strike path 
        strikePath = [];
        strikePath.push(this);

        //picks the first orb to be hit
        var startX = this.x;
        var startY = this.y;
        var pickedOrb = this.neighborOrbs[(Math.floor(Math.random() * this.neighborOrbs.length))];
        var endX = pickedOrb.x;
        var endY = pickedOrb.y;
        gameEngine.addEntity(new Lightning(gameEngine, startX, startY, endX, endY));
        totalStrikes++;
        totalJumps++;
        pickedOrb.hitByLightning = true;
        pickedOrb.strikesLeft = 0;
        strikePath.push(pickedOrb);
        
        //if orb is between 25%-49% full, add 1 strike
        if (pickedOrb.fullness >= 0.5 && pickedOrb.fullness < 1.0) { 
            pickedOrb.strikesLeft = pickedOrb.strikesLeft + 1;
        //if orb is 50%-74%, add 2 strikes
        } else if (pickedOrb.fullness >= 1.0 && pickedOrb.fullness < 1.5) {
            pickedOrb.strikesLeft = pickedOrb.strikesLeft + 2;
        //if orb is 75%-100%, add 3 strikes
        } else if (pickedOrb.fullness >= 1.5) {
            pickedOrb.strikesLeft = pickedOrb.strikesLeft + 3;
        }

        //adds the orb number to the array which keeps track of orbs hit
        orbsThatHaveBeenHit.push(pickedOrb.orbNumber);
        //console.log(orbsThatHaveBeenHit);

        //reset the lightning timer for the starting orb
        this.lightningTimer = 55;
        this.endGameLightningTimer = 100;
    } else {
        this.lightningTimer--;
    }

    //displays the 'winning' lightning line repeatedly
    //after the last orb has been hit
    if (this.startingLineOrb == true && this.lightningTimer < 0 
                                     && this.endGameLightningTimer == 0) {
        for(var i = 0; i < (strikePath.length - 1); i++ ) {
            var startX = strikePath[i].x;
            var startY = strikePath[i].y;
            var endX = strikePath[i+1].x;
            var endY = strikePath[i+1].y;
            gameEngine.addEntity(new Lightning(gameEngine, startX, startY, endX, endY));
        }
        this.game.entities[0].gameOver = true;
        this.endGameLightningTimer = 100;
    } else {
        this.endGameLightningTimer--;
    }

    if (this.endGameLightningTimer == 70 && this.lightningTimer < 0 
                                         && this.game.entities[0].gameStart == false) {
        gameEngine.addEntity(new WWCD(gameEngine, AM.getAsset("./img/WWCD.png")));
    }
}





var gameEngine = new GameEngine();
var AM = new AssetManager();

AM.queueDownload("./img/storm750.jpg");
AM.queueDownload("./img/WWCD.png");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");
    gameEngine.init(ctx);
    gameEngine.start();

    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/storm750.jpg")));
    
    
    var sX = 35;
    var sY = 35;
    var orbNum = 0;

    //makes all the orbs
    for (var i=0; i < 10; i++) {
        for (var j=0; j < 10; j++) {
            //assign each orb to its location
            gameEngine.addEntity(new Orb(gameEngine, sX, sY, orbNum));
            sX += 75;
            orbNum++;
        }
        sY+= 75;
        sX-=750;
    }

    //assign all neighbor orbs to each orb
    for (var i=1; i < 101; i++) {
        for (var j=1; j < 101; j++) {
            var a = gameEngine.entities[i].x - gameEngine.entities[j].x;
            var b = gameEngine.entities[i].y - gameEngine.entities[j].y;
            var lineLength = Math.ceil(Math.sqrt( a*a + b*b ));

            if (lineLength <= 107 && i != j) {
                gameEngine.entities[i].neighborOrbs.push(gameEngine.entities[j]);
            }
        }
    }
    
    // //used for verifying the orbs have the correct neighbors
    // for (var i=1; i < 101; i++) {
    //     console.log(gameEngine.entities[i].description);
    //     console.log(gameEngine.entities[i].neighborOrbs);
    // }

    //sets the flag for where the lightning will be starting
    //and where the finish line is
    gameEngine.entities[10].startingLineOrb = true;
    gameEngine.entities[91].finishLineOrb = true;

    

    console.log("All Done!");
});
