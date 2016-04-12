var express = require('express');
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/acroDb'
// URL from heroku postgres db: postgres://xqglthfdgjiodt:b6FNyHPL8v1ClbUFMezqb7GO-O@ec2-23-21-42-29.compute-1.amazonaws.com:5432/da8vkru069g43t?ssl=true
console.log("process.env.DATABASE_URL", process.env.DATABASE_URL)
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

// serve client folder
app.use(express.static(__dirname + '/../client'));

// serve node_modules
// TODO: find different solution; this is NOT best practice - node modules shouldn't be served
app.use(express.static(__dirname + '/../node_modules'));

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
		client.query('SELECT "meetID" FROM "meetNames" WHERE "meetName" = $1 AND "meetYear" = $2', [req.body.meetName, req.body.year],
			function(err, result) {
				if (err) {
					console.log('error in query getting existingMeetNameID', err);
				} else {
					// if result doesn't have any rows, meet name isn't in table yet
					if (result.rows[0] === undefined) {
						// insert into meets table
						client.query('INSERT INTO "meetNames" ("meetName", "meetYear") values ($1, $2)',
							[req.body.meetName, req.body.year],
							function(err, result) {
								if (err) {
									console.log('error in insert query for meetNames table', err);
								} else {
									console.log('data inserted into meetNames table');
									// select current meetnameID
									client.query('SELECT "meetID" FROM "meetNames" WHERE "meetName" = $1 AND "meetYear" = $2', [req.body.meetName, req.body.year],
										function(err, result) {
											if (err) {
												console.log('error in query getting currentMeetNameID', err);
											} else {
												// store meet id from database
												var meetNameID = result.rows[0].meetID;

												// select current pairgroupID // note: putting the query string on multiple lines throws an error from whitespace
												client.query('SELECT "pairgroups_id" FROM "pairgroups" WHERE "athlete1" = $1 OR "athlete2" = $1 OR "athlete3" = $1 OR "athlete4" = $1 AND "athlete1" = $2 OR "athlete2" = $2 OR "athlete3" = $2 OR "athlete4" = $2 AND "athlete1" = $3 OR "athlete3" = $3 OR "athlete3" = $3 OR "athlete4" = $3 AND "athlete1" = $4 OR "athlete4" = $4 OR "athlete3" = $4 OR "athlete4" = $4',
													[req.body.athlete1, req.body.athlete2, req.body.athlete3, req.body.athlete4],
													function(err, result) {
														if (err) {
															console.log('error in query getting pairgroups_id', err);
														} else {
															// if result doesn't have rows, then pairgroup isn't in table yet
															if (result.rows[0] === undefined) {
																console.log('pairgroup isnt in table yet')
																// athlete names not found so insert athlete names into pairgroups table
																client.query('INSERT INTO pairgroups ("athlete1", "athlete2", "athlete3", "athlete4", "teamName") values ($1, $2, $3, $4, $5)',
																	[req.body.athlete1, req.body.athlete2, req.body.athlete3, req.body.athlete4, req.body.teamName],
																	function(err, result) {
																		if (err) {
																			console.log('error in insert query for pairgroups table', err);
																		} else {
																			console.log('data inserted into pairgroups table');
																			// select current pairgroupID // note: putting the query string on multiple lines throws an error from whitespace
																			client.query('SELECT "pairgroups_id" FROM "pairgroups" WHERE "athlete1" = $1 OR "athlete2" = $1 OR "athlete3" = $1 OR "athlete4" = $1 AND "athlete1" = $2 OR "athlete2" = $2 OR "athlete3" = $2 OR "athlete4" = $2 AND "athlete1" = $3 OR "athlete3" = $3 OR "athlete3" = $3 OR "athlete4" = $3 AND "athlete1" = $4 OR "athlete4" = $4 OR "athlete3" = $4 OR "athlete4" = $4',
																				[req.body.athlete1, req.body.athlete2, req.body.athlete3, req.body.athlete4],
																				function(err, result) {
																					if (err) {
																						console.log('error in query getting pairgroups_id', err);
																					} else {
																						// store pairgroups_id from database
																						var pairgroupsID = result.rows[0].pairgroups_id;

																						// insert meet id and pairgroupsID into junction table if it's not already there
																						client.query('SELECT "pk_junctionid" FROM "junction_meets-pairgroups" WHERE "meetID" = $1 AND "pairgroupID" = $2',
																							[meetNameID, pairgroupsID],
																							function(err, result) {
																								if (err) {
																									console.log('error in query selecting IDs from junction table', err);
																								} else {
																									// if there are no rows in result, then the ids aren't in table yet
																									if (result.rows[0] === undefined) {
																										// meet id and pairgroupsID not already there, so insert into junction table
																										client.query('INSERT INTO "junction_meets-pairgroups" ("meetID", "pairgroupID") values ($1, $2)',
																											[meetNameID, pairgroupsID],
																											function(err, result) {
																												if (err) {
																													console.log('error in query inserting IDs into junction table', err);
																												} else {
																													console.log('data inserted into junction table');
																												}
																											}
																										);
																									} else {
																										// id's are already in table
																										console.log('that data already exists in junction table');
																									}
																								}
																							}
																						);
																						// insert everything into scores table
																						client.query('INSERT INTO "scores" ("routineType", "artistry", "execution", "difficulty", "penalties", "total", "pairgroup_id", "meetID") values ($1, $2, $3, $4, $5, $6, $7, $8)',
																							[req.body.routineType, req.body.artistry, req.body.execution, req.body.difficulty, req.body.penalties, req.body.totalScore, pairgroupsID, meetNameID],
																							function(err, result) {
																								if (err) {
																									console.log('error in query inserting into scores table', err);
																								} else {
																									console.log('data inserted into scores table');
																									// sent back all scores from selected pairgroup
																									var resultsQuery = client.query('SELECT * FROM "scores" INNER JOIN pairgroups ON scores.pairgroup_id = pairgroups.pairgroups_id INNER JOIN "meetNames" ON scores."meetID" = "meetNames"."meetID" WHERE scores.pairgroup_id = $1',
																										[pairgroupsID]);

																									resultsQuery.on('row', function(row) {
																										results.push(row);
																									});

																									resultsQuery.on('end', function() {
																										done();
																										return res.json(results);
																									});
																								}
																							}
																						);
																					}
																				}
																			);
																		}
																	}
																);
															} else {
																// pairgroup is already in table
																console.log('that data already exists in pairgroups table')
																// store pairgroupsID from database
																var pairgroupsID = result.rows[0].pairgroups_id;

																// insert meet id and pairgroupsID into junction table if it's not already there
																client.query('SELECT "pk_junctionid" FROM "junction_meets-pairgroups" WHERE "meetID" = $1 AND "pairgroupID" = $2',
																	[meetNameID, pairgroupsID],
																	function(err, result) {
																		if (err) {
																			console.log('error in query selecting IDs from junction table', err);
																		} else {
																			// if there are no rows in result, then the ids aren't in table yet
																			if (result.rows[0] === undefined) {
																				// meet id and pairgroupsID not already there, so insert into junction table
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
																			} else {
																				// id's are already in table
																				console.log('that data already exists in junction table');
																			}
																		}
																	}
																);
																// insert everything into scores table
																client.query('INSERT INTO "scores" ("routineType", "artistry", "execution", "difficulty", "penalties", "total", "pairgroup_id", "meetID") values ($1, $2, $3, $4, $5, $6, $7, $8)',
																	[req.body.routineType, req.body.artistry, req.body.execution, req.body.difficulty, req.body.penalties, req.body.totalScore, pairgroupsID, meetNameID],
																	function(err, result) {
																		if (err) {
																			console.log('error in query inserting into scores table', err);
																		} else {
																			console.log('data inserted into scores table');
																			// send back all scores from selected pairgroup
																			var resultsQuery = client.query('SELECT * FROM "scores" INNER JOIN pairgroups ON scores.pairgroup_id = pairgroups.pairgroups_id INNER JOIN "meetNames" ON scores."meetID" = "meetNames"."meetID" WHERE scores.pairgroup_id = $1',
																				[pairgroupsID]);

																			resultsQuery.on('row', function(row) {
																				results.push(row);
																			});

																			resultsQuery.on('end', function() {
																				done();
																				return res.json(results);
																			});
																		}
																	}
																);
															}
														}
													}
												);
											}
										}
									);
								}
							}
						);
					// else meet is already in table
					} else {
						console.log('meet data already exists in meetNames table')
						// store meet id from database
						var existingMeetNameID = result.rows[0].meetID // returns a number

						// select current pairgroupID // note: putting the query string on multiple lines throws an error from whitespace
						client.query('SELECT "pairgroups_id" FROM "pairgroups" WHERE "athlete1" = $1 OR "athlete2" = $1 OR "athlete3" = $1 OR "athlete4" = $1 AND "athlete1" = $2 OR "athlete2" = $2 OR "athlete3" = $2 OR "athlete4" = $2 AND "athlete1" = $3 OR "athlete3" = $3 OR "athlete3" = $3 OR "athlete4" = $3 AND "athlete1" = $4 OR "athlete4" = $4 OR "athlete3" = $4 OR "athlete4" = $4',
							[req.body.athlete1, req.body.athlete2, req.body.athlete3, req.body.athlete4],
							function(err, result) {
								if (err) {
									console.log('error in query getting pairgroups_id', err);
								} else {
									// if result doesn't have rows, then pairgroup isn't in table yet
									if (result.rows[0] === undefined) {
										console.log('pairgroup isnt in table yet')
										// athlete names not found so insert athlete names into pairgroups table
										client.query('INSERT INTO pairgroups ("athlete1", "athlete2", "athlete3", "athlete4", "teamName") values ($1, $2, $3, $4, $5)',
											[req.body.athlete1, req.body.athlete2, req.body.athlete3, req.body.athlete4, req.body.teamName],
											function(err, result) {
												if (err) {
													console.log('error in insert query for pairgroups table', err);
												} else {
													console.log('data inserted into pairgroups table');
													// select current pairgroupID // note: putting the query string on multiple lines throws an error from whitespace
													client.query('SELECT "pairgroups_id" FROM "pairgroups" WHERE "athlete1" = $1 OR "athlete2" = $1 OR "athlete3" = $1 OR "athlete4" = $1 AND "athlete1" = $2 OR "athlete2" = $2 OR "athlete3" = $2 OR "athlete4" = $2 AND "athlete1" = $3 OR "athlete3" = $3 OR "athlete3" = $3 OR "athlete4" = $3 AND "athlete1" = $4 OR "athlete4" = $4 OR "athlete3" = $4 OR "athlete4" = $4',
														[req.body.athlete1, req.body.athlete2, req.body.athlete3, req.body.athlete4],
														function(err, result) {
															if (err) {
																console.log('error in query getting pairgroups_id', err);
															} else {
																// store pairgroupsID from database
																var pairgroupsID = result.rows[0].pairgroups_id;

																// insert meet id and pairgroupsID into junction table if it's not already there
																client.query('SELECT "pk_junctionid" FROM "junction_meets-pairgroups" WHERE "meetID" = $1 AND "pairgroupID" = $2',
																	[existingMeetNameID, pairgroupsID],
																	function(err, result) {
																		if (err) {
																			console.log('error in query selecting IDs from junction table', err);
																		} else {
																			// if there are no rows in result, then the ids aren't in table yet
																			if (result.rows[0] === undefined) {
																				// meet id and pairgroupsID not already there, so insert into junction table
																				client.query('INSERT INTO "junction_meets-pairgroups" ("meetID", "pairgroupID") values ($1, $2)',
																					[existingMeetNameID, pairgroupsID],
																					function(err, result) {
																						if (err) {
																							console.log('error in query inserting IDs into junction table', err);
																						} else {
																							console.log('data inserted into junction table')
																						}
																					}
																				);
																			} else {
																				// id's are already in table
																				console.log('that data already exists in junction table');
																			}
																		}
																	}
																);
																// insert everything into scores table
																client.query('INSERT INTO "scores" ("routineType", "artistry", "execution", "difficulty", "penalties", "total", "pairgroup_id", "meetID") values ($1, $2, $3, $4, $5, $6, $7, $8)',
																	[req.body.routineType, req.body.artistry, req.body.execution, req.body.difficulty, req.body.penalties, req.body.totalScore, pairgroupsID, existingMeetNameID],
																	function(err, result) {
																		if (err) {
																			console.log('error in query inserting into scores table', err);
																		} else {
																			console.log('data inserted into scores table');
																			// send back all scores from selected pairgroup
																			var resultsQuery = client.query('SELECT * FROM "scores" INNER JOIN pairgroups ON scores.pairgroup_id = pairgroups.pairgroups_id INNER JOIN "meetNames" ON scores."meetID" = "meetNames"."meetID" WHERE scores.pairgroup_id = $1',
																				[pairgroupsID]);

																			resultsQuery.on('row', function(row) {
																				results.push(row);
																			});

																			resultsQuery.on('end', function() {
																				done();
																				return res.json(results);
																			});
																		}
																	}
																);
															}
														}
													);
												}
											}
										);
									} else {
										// pairgroup is already in table
										console.log('that data already exists in pairgroups table')
										// store pairgroupsID from database
										var pairgroupsID = result.rows[0].pairgroups_id;

										// insert meet id and pairgroupsID into junction table if it's not already there
										client.query('SELECT "pk_junctionid" FROM "junction_meets-pairgroups" WHERE "meetID" = $1 AND "pairgroupID" = $2',
											[existingMeetNameID, pairgroupsID],
											function(err, result) {
												if (err) {
													console.log('error in query selecting IDs from junction table', err);
												} else {
													// if there are no rows in result, then the ids aren't in table yet
													if (result.rows[0] === undefined) {
														// meet id and pairgroupsID not already there, so insert into junction table
														client.query('INSERT INTO "junction_meets-pairgroups" ("meetID", "pairgroupID") values ($1, $2)',
															[existingMeetNameID, pairgroupsID],
															function(err, result) {
																if (err) {
																	console.log('error in query inserting IDs into junction table', err);
																} else {
																	console.log('data inserted into junction table')
																}
															}
														);
													} else {
														// id's are already in table
														console.log('that data already exists in junction table');
													}
												}
											}
										);
										// insert everything into scores table
										client.query('INSERT INTO "scores" ("routineType", "artistry", "execution", "difficulty", "penalties", "total", "pairgroup_id", "meetID") values ($1, $2, $3, $4, $5, $6, $7, $8)',
											[req.body.routineType, req.body.artistry, req.body.execution, req.body.difficulty, req.body.penalties, req.body.totalScore, pairgroupsID, existingMeetNameID],
											function(err, result) {
												if (err) {
													console.log('error in query inserting into scores table', err);
												} else {
													console.log('data inserted into scores table');
													// send back all scores from selected pairgroup
													var resultsQuery = client.query('SELECT * FROM "scores" INNER JOIN pairgroups ON scores.pairgroup_id = pairgroups.pairgroups_id INNER JOIN "meetNames" ON scores."meetID" = "meetNames"."meetID" WHERE scores.pairgroup_id = $1',
														[pairgroupsID]);

													resultsQuery.on('row', function(row) {
														results.push(row);
													});

													resultsQuery.on('end', function() {
														done();
														return res.json(results);
													});
												}
											}
										);
									}
								}
							}
						);
					}
				}
			}
		);


		// TODO: rewrite this query to select all score info from scores table inner join pairgroups table on column = column where pairgroupsid = pairgroups primary key
			// + select meet info from meets table inner join scores table on column = column where meetid = meet primary key
			// + select pairgroup info from pairgroups table inner join scores table on column = column where pairgroupid = pairgroup primary key
		// select group number and athletes from pairgroups table
		// var query = client.query('SELECT * FROM "pairgroups" WHERE "athlete1" = $1 OR "athlete2" = $1 OR "athlete3" = $1 OR "athlete4" = $1 AND "athlete1" = $2 OR "athlete2" = $2 OR "athlete3" = $2 OR "athlete4" = $2 AND "athlete1" = $3 OR "athlete3" = $3 OR "athlete3" = $3 OR "athlete4" = $3 AND "athlete1" = $4 OR "athlete4" = $4 OR "athlete3" = $4 OR "athlete4" = $4',
		// 	[req.body.athlete1, req.body.athlete2, req.body.athlete3, req.body.athlete4]);

		// // stream results back one row at a time
		// query.on('row', function(row) {
		// 	results.push(row);
		// });

		// query.on('end', function() {
		// 	done();
		// 	return res.json(results);
		// })
		//============= return data
		// var pairgroupsID = 3;
		// var resultsQuery = client.query('SELECT * FROM "scores" INNER JOIN pairgroups ON scores.pairgroup_id = pairgroups.pairgroups_id INNER JOIN "meetNames" ON scores."meetID" = "meetNames"."meetID" WHERE scores.pairgroup_id = $1',
		// 	[pairgroupsID]);

		// resultsQuery.on('row', function(row) {
		// 	results.push(row);
		// });

		// resultsQuery.on('end', function() {
		// 	done();
		// 	return res.json(results);
		// });

	})
	// res.send("done")
});

// app.post('/api/getscores', function(req, res) {
// 	// create array to hold results
// 	console.log('req.body===============', req.body)
// 	var results = [];

// 	// if search type is athletes
// 		// 'SELECT * FROM "scores" INNER JOIN pairgroups ON scores.pairgroup_id = pairgroups.pairgroups_id INNER JOIN "meetNames" ON scores."meetID" = "meetNames"."meetID" WHERE ...?'

// 	// else if search type is meet
// 		// 'SELECT * FROM "meetNames" WHERE'
// 		// 'SELECT * FROM "scores" INNER JOIN pairgroups ON scores.pairgroup_id = pairgroups.pairgroups_id INNER JOIN "meetNames" ON scores."meetID" = "meetNames"."meetID" WHERE ...?'


// 	// send back all scores from selected pairgroup
// 	// var resultsQuery = client.query('SELECT * FROM "scores" INNER JOIN pairgroups ON scores.pairgroup_id = pairgroups.pairgroups_id INNER JOIN "meetNames" ON scores."meetID" = "meetNames"."meetID" WHERE scores.pairgroup_id = $1',
// 	// 	[pairgroupsID]);

// 	// resultsQuery.on('row', function(row) {
// 	// 	results.push(row);
// 	// });

// 	// resultsQuery.on('end', function() {
// 	// 	done();
// 	// 	return res.json(results);
// 	// });
// });

app.get('/api/getathletesmeets', function(req, res) {
	// create array to hold results
	var results = {};
	results.meets = [];
	results.athletes = [];

	// connect to database
	pg.connect(connectionString, function(err, client, done) {
		// handle connection errors
		if (err) {
			console.log('error connecting to database when getting athlete and meet lists', err);
			return res.status(500).json({
				success: false,
				data: err
			});
		};

		// select all meets
		var meetsQuery = client.query('SELECT * FROM "meetNames"');

		// select all athletes
		var athletesQuery = client.query('SELECT * FROM "pairgroups"');

		meetsQuery.on('row', function(row) {
			// store meets
			results.meets.push(row);
		});

		meetsQuery.on('end', function() {
			// store athletes
			athletesQuery.on('row', function(row) {
				results.athletes.push(row);
			});

			athletesQuery.on('end', function() {
				done();
				return res.json(results);
			});
		});
	});
});

app.post('/api/getscoresfromathletes', function(req, res) {
	// create array to hold results
	var results = [];

	// connect to database
	pg.connect(connectionString, function(err, client, done) {
		// handle connection errors
		if (err) {
			console.log('error connecting to database when getting scores from athletes', err);
			return res.status(500).json({
				success: false,
				data: err
			});
		}

		// find pairgroupsID based on input
		client.query('SELECT "pairgroups_id" FROM "pairgroups" WHERE "athlete1" = $1 OR "athlete2" = $1 OR "athlete3" = $1 OR "athlete4" = $1 AND "athlete1" = $2 OR "athlete2" = $2 OR "athlete3" = $2 OR "athlete4" = $2 AND "athlete1" = $3 OR "athlete3" = $3 OR "athlete3" = $3 OR "athlete4" = $3 AND "athlete1" = $4 OR "athlete4" = $4 OR "athlete3" = $4 OR "athlete4" = $4',
			[req.body.athlete1, req.body.athlete2, req.body.athlete3, req.body.athlete4],
			function(err, result) {
				if (err) {
					console.log('error in query getting pairgroups_id', err);
				} else {
					// store pairgroupsID from database
					var pairgroupsID = result.rows[0].pairgroups_id;

					// select scores where the athletes match
					var queryScoresFromAthletes = client.query('SELECT * FROM "scores" INNER JOIN pairgroups ON scores.pairgroup_id = pairgroups.pairgroups_id INNER JOIN "meetNames" ON scores."meetID" = "meetNames"."meetID" WHERE scores.pairgroup_id = $1 ORDER BY "meetNames"."meetYear" DESC, "meetNames"."meetID"',
						[pairgroupsID]);

					queryScoresFromAthletes.on('row', function(row) {
						results.push(row);
					});

					queryScoresFromAthletes.on('end', function() {
						done();
						return res.json(results);
					});
				}
			}
		);
	});
});

app.post('/api/getscoresfrommeets', function(req, res) {
	// create array to hold results
	var results = [];

	// connect to database
	pg.connect(connectionString, function(err, client, done) {
		// handle connection errors
		if (err) {
			console.log('error connecting to database when getting scores from meets', err);
			return res.status(500).json({
				success: false,
				data: err
			});
		}

		// find meetID based on input
		client.query('SELECT "meetID" FROM "meetNames" WHERE "meetName" = $1 AND "meetYear" = $2', [req.body.meetName, req.body.meetYear],
			function(err, result) {
				if (err) {
					console.log('error in query getting meetNameID', err);
				} else {
					// store meetID from database
					var meetID = result.rows[0].meetID;

					// select scores where the meet id's match
					var queryScoresFromMeets = client.query('SELECT * FROM "scores" INNER JOIN pairgroups ON scores.pairgroup_id = pairgroups.pairgroups_id INNER JOIN "meetNames" ON scores."meetID" = "meetNames"."meetID" WHERE scores."meetID" = $1 ORDER BY "pairgroups"."pairgroups_id"',
						[meetID]);

					queryScoresFromMeets.on('row', function(row) {
						results.push(row);
					});

					queryScoresFromMeets.on('end', function() {
						done();
						// console.log("results", results)
						return res.json(results);
					});
				}
			}
		);
	});
});










