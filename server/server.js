var express = require('express');
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/acroDb'
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

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
		console.log('database connected')
	});
});

// this line makes the ../ not seem malicious. doesn't work without this line
app.use(express.static(__dirname + '/../client'))

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/../client/index.html');
});

var host = '127.0.0.1' // server.address.address;
var port = process.env.PORT || 3000 // server.address.port;

app.listen(port, function(){
	console.log('Listening on http://' + host + ':' + port);
});


//============ TODO: move these to new request handler folder =========//

app.post('/api/scores', function(req, res) {
	// create array to hold results
	console.log('req.body===============', req.body)
	var results = [];

	// grab data from http request
	// var data = {
	// 	text: req.body.text
	// };
	// connect to db
	pg.connect(connectionString, function(err, client, done) {
		// handle connection errors
		if (err) {
			console.log('error connecting to database when posting score', err);
			return res.status(500).json({
				success: false,
				data: err
			});
		};

		// insert athlete names and group number into table
		client.query('INSERT INTO pairgroups ("groupNumber", "athlete1", "athlete2", "athlete3", "athlete4") values ($1, $2, $3, $4, $5)',
			[req.body.groupNumber, req.body.athlete1, req.body.athlete2, req.body.athlete3, req.body.athlete4],
			function(err, result) {
				if (err) {
					console.log('error in insert query', err);
				} else {
					console.log('data inserted into table')
				}

			}
		);
/*
		var query = client.query('SELECT "groupNumber", "athlete1", "athlete2", "athlete3", "athlete4" FROM pairgroups');

		// stream results back one row at a time
		query.on('row', function(row) {
			results.push(row);
		});

		query.on('end', function() {
			done();
			return res.json(results);
		})
*/
	})
	// res.send("done")
})
