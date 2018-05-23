var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  mongoose = require('mongoose'),
  Models = require('./api/models/models'),
  bodyParser = require('body-parser'),
  http = require('http').Server(app),
  io = require('socket.io')(http);

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/livrenum', { useMongoClient: true });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./api/routes/routes');
routes(app);

app.listen(port);
console.log('LivreNumérique RESTful API - Serveur démarré sur le port ' + port);

io.on('connection', function(socket) {
  console.log("Connexion! " + socket.id);
});
