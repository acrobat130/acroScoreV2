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
		// note on setting up primary auto-incrementing keys in pgadmin: http://dba.stackexchange.com/questions/1281/how-do-i-specify-that-a-column-should-be-auto-incremented-in-pgadmin


		// insert meet name and year into meets table if it's not already there
		client.query('SELECT "meetID" FROM "meetNames" WHERE "meetName" = $1', [req.body.meetName],
			function(err, result) {
				if (err) {
					console.log('error in query getting existingMeetNameID', err);
				} else {
					// store meet id from database
					// var existingMeetNameID = result.rows[0].meetID // returns a number
					// if id isn't found, meet name isn't in table yet
					console.log("result.rows[0]", result.rows[0])
					if (result.rows[0] === undefined) {
						// insert into meets table
						client.query('INSERT INTO "meetNames" ("meetName", "meetYear") values ($1, $2)',
							[req.body.meetName, req.body.year],
							function(err, result) {
								if (err) {
									console.log('error in insert query for meetNames table', err);
								} else {
									console.log('data inserted into meetNames table');
								}
							}
						);
						// select current meetnameID
						client.query('SELECT "meetID" FROM "meetNames" WHERE "meetName" = $1', [req.body.meetName],
							function(err, result) {
								if (err) {
									console.log('error in query getting currentMeetNameID', err);
								} else {
									// store meet id from database
									var meetNameID = result.rows[0].meetID;

									// select current pairgroupID // note: putting the query string on multiple lines throws an error from whitespace
									client.query('SELECT "pairgroupsID" FROM "pairgroups" WHERE "athlete1" = $1 OR "athlete2" = $1 OR "athlete3" = $1 OR "athlete4" = $1 AND "athlete1" = $2 OR "athlete2" = $2 OR "athlete3" = $2 OR "athlete4" = $2 AND "athlete1" = $3 OR "athlete3" = $3 OR "athlete3" = $3 OR "athlete4" = $3 AND "athlete1" = $4 OR "athlete4" = $4 OR "athlete3" = $4 OR "athlete4" = $4',
										[req.body.athlete1, req.body.athlete2, req.body.athlete3, req.body.athlete4],
										function(err, result) {
											if (err) {
												console.log('error in query getting pairgroupsID', err);
											} else {
												// store pairgroupsID from database
												var pairgroupsID = result.rows[0].pairgroupsID;

												// insert meet id and pairgroupsID into junction table
												client.query('INSERT INTO "junction_meets-pairgroups" ("meetID", "pairgroupID") values ($1, $2)',
													[meetNameID, pairgroupsID],
													function(err, result) {
														if (err) {
															console.log('error in query inserting IDs into junction table', err);
														} else {
															console.log('data inserted into junction table')
														}
													}
												);
											}
										}
									);
								}
							}
						);
					}
				}
			}
		);


		// insert athlete names and group number into pairgroups table
		client.query('INSERT INTO pairgroups ("athlete1", "athlete2", "athlete3", "athlete4", "teamName") values ($1, $2, $3, $4, $5)',
			[req.body.athlete1, req.body.athlete2, req.body.athlete3, req.body.athlete4, req.body.teamName],
			function(err, result) {
				if (err) {
					console.log('error in insert query for pairgroups table', err);
				} else {
					console.log('data inserted into pairgroups table');
				}
			}
		);

		// TODO: get primary key from meets table
		// var meetNamesPrimaryKey = client.query('SELECT "meetID" FROM "meetNames" WHERE ')

		// TODO: get primary key from pairgroups table

		// TODO: insert meet and pairgroup foreign keys into junction table

		// TODO: insert routine type, artistry, execution, difficulty, penalties, total score into scores table

		// TODO: store current athlete names from req.body.athlete1-4
		//
		// TODO: rewrite this query to select all score info from scores table inner join pairgroups table on column = column where pairgroupsid = pairgroups primary key
			// + select meet info from meets table inner join scores table on column = column where meetid = meet primary key
			// + select pairgroup info from pairgroups table inner join scores table on column = column where pairgroupid = pairgroup primary key
		// select group number and athletes from pairgroups table
		var query = client.query('SELECT "athlete1", "athlete2", "athlete3", "athlete4", "teamName" FROM pairgroups');

		// stream results back one row at a time
		query.on('row', function(row) {
			results.push(row);
		});

		query.on('end', function() {
			done();
			return res.json(results);
		})

	})
	// res.send("done")
})
