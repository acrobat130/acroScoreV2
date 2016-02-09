express = require('express');
// var path = require('path');
var app = express();

// this line makes the ../ not seem malicious. doesn't work without this line
app.use(express.static(__dirname + '/../client'))

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/../client/index.html');
});

var server = app.listen(3000, function(){
	var host = "127.0.0.1" // server.address.address;
	var port = 3000 // server.address.port;

	console.log('Listening on http://' + host + ':' + port);
});

