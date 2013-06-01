
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app);

var io = require("socket.io").listen(server);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// io.sockets.on('connection', function (socket) {
//   socket.on('testShowPage', function (data) {
//   	  if (data) {
// 		  socket.emit('showPage', { page: data });
//   	  } else {
// 		  socket.emit('showPage', { page: 'q2' });
//   	  }
//       console.log("data");
//   });


//   socket.on('testUpdateScores', function (data) {
// 	  socket.emit('updateScores', [{'name': "sheldon", "score": "3"},{'name': "Te", "score": 4}]);
//       console.log("data");
//   });


// });






//stuff that should go into gamelogic.js

var players = {};

var Player = function(name) {
  this.score = 0;
  this.name = name
};

var gCurrentBounty = 1000;
var gMaxBounty = 1000;
var gBountyCooldown = 100;
var gQuestionsCount = 10; 
var giq = 0;
var gTicks = 20;
var gShowScores = false;


function startGame() {
  setTimeout(gameTick, 2000);
  //setInterval(updateScores, 1000);
}

function nextQuestion() {
  console.log("next question");
  io.sockets.emit("showPage", {page: "q" + giq});
  giq++;
  setTimeout(gameTick, 7000);
}

function showScores() {
  io.sockets.emit("showPage", {page: "scores"})
  setTimeout(gameTick, 8000);
  giq = 0;
}

function updateScores() {
  console.log("update scores");
  var lst = [];
  for(var key in players) {
    lst.push(players[key]);
  }
  io.sockets.emit("updateScores",lst);
  console.dir(lst);


}

function gameTick() {
  if(giq < gQuestionsCount) {
    //giq++;
    nextQuestion();
  } else {
    showScores();
  }
}


startGame();

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });


  socket.on("newPlayer", function (data) {
    console.log("new player request: %s", data.name);
    if(data.name) {
      var player = new Player(data.name);
      players[player.name] = player;
    }
  });

  //player makes a guess
  //data.name
  //data.answer
  socket.on("playerGuess", function(data) {

    console.log("playerGuess", data);

    var player = players[data.name];
    if(!data.name){
      player = new Player(data.name);
      players[data.name] = player;
    }

    if(!player) {
      console.log("player does not exist: %s", data.name);
    }

    //HACK: bump up against answer key
    if(data.answer === "a1") {
      player.score += gCurrentBounty;
    }
  });

});














