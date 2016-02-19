var express = require('express');
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/acroDb'

var app = express();

// initialize connection pool
// keeps idle connections open for 30 seconds and set limit of 20
pg.connect(connectionString, function(err, client, done) {
	if (err) {
		return console.error('error fetching client from pool', err);
	}
	client.query('SELECT $1::int AS number', ['1'], function(err, result) {
		// call done to release client back to pool
		done();

		if (err) {
			return console.error('error running query', err);
		}
		console.log(result.rows[0].number);
		// output: 1
	});
});

// this line makes the ../ not seem malicious. doesn't work without this line
app.use(express.static(__dirname + '/../client'))

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/../client/index.html');
});

app.listen(3000, function(){
	var host = "127.0.0.1" // server.address.address;
	var port = 3000 // server.address.port;

	console.log('Listening on http://' + host + ':' + port);
});

