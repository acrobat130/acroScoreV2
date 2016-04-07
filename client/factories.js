angular.module('acroScore.factories', [])

.factory('getPostFactory', ['$http', function($http){
	// return console.log("inside the getPostFactory")
	var url = '/api/scores';
	var groupJustPosted = {};
	var athleteList = {};
	var meetList = {};
	var scoreJustAdded = {
		wasScoreJustAdded: false};

	var consoleSomething = function(scoreInfoFromUserInput) {
		console.log("inside getPostFactory");
		console.log("testing scoreInfoFromUserInput variable", scoreInfoFromUserInput)
	};

	var postScore = function(data) {
		console.log("data in postScore", data)
		return $http({
			method: 'POST',
			url: '/api/scores',
			data: data
		})
		// return $http.post(url, data)
		.then(function(response) {
			console.log("data successfully posted");
			console.log("response returned from post", response)
			groupJustPosted.data = response.data;
			scoreJustAdded.wasScoreJustAdded = true;
			return response.data;
		})
	};

	var getScoresFromAthletes = function(data) {
		return $http({
			method: 'POST',
			url: '/api/getscoresfromathletes',
			data: data
		})
		.then(function(response) {
			console.log("successfully fetched data");
			console.log("response returned from getScoresFromAthletes request", response);
			groupJustPosted.data = response.data;
			return response.data;
		})
	};

	var getScoresFromMeets = function(data) {
		return $http({
			method: 'POST',
			url: '/api/getscoresfrommeets',
			data: data
		})
		.then(function(response) {
			console.log("successfully fetched data");
			console.log("response returned from getScoresFromMeets request", response);
			groupJustPosted.data = response.data;
			return response.data;
		})
	}

	var fetchAthletesAndMeets = function() {
		return $http({
			method: 'GET',
			url: '/api/getathletesmeets'
		})
		.then(function(response) {
			console.log('successfully fetched data');
			console.log('response returned from fetchAthletesAndMeets GET request', response);
			athleteList.data = response.data;
			meetList.data = response.data;
			return response.data;
		})
	};

	var formatAthleteChartData = function(array) { // takes array of objects as the input
		// push into athleteChartData an array of each series to graph
		// [0] = balance, [1] = dynamic, [2] = combined
		var balanceArray = [];
		var dynamicArray = [];
		var combinedArray = [];
		var meetTotalScoreArray = [];
		var meetNamesArray = [];
		// object for storing scores grouped by each meet
		var meetDetailsObj = {};
		var resultsObj = {};

		// iterate through input array of scores
		for (var i = 0; i < array.length; i++) {
			var meetName = array[i].meetName;
			var meetYear = array[i].meetYear;
			var meetNameAndYear = meetName + ' ' + meetYear;
			var routineTotal = Number(array[i].total);

			// add meet to the meetDetails obj if it's not already in there
			if (!meetDetailsObj[meetNameAndYear]) {
				meetDetailsObj[meetNameAndYear] = new Meet(meetName, meetYear);
			}
			// add score to meetdetails obj
			if (array[i].routineType === 'balance') {
				meetDetailsObj[meetNameAndYear].balance = routineTotal;
			} else if (array[i].routineType === 'dynamic') {
				meetDetailsObj[meetNameAndYear].dynamic = routineTotal;
			} else if (array[i].routineType === 'combined') {
				meetDetailsObj[meetNameAndYear].combined = routineTotal;
			}
		}

		// iterate through meetDetails obj to calculate meetTotals
		for (var meet in meetDetailsObj) {
			if (meetDetailsObj.hasOwnProperty(meet)) {
				var balance = Number(meetDetailsObj[meet].balance);
				var dynamic = Number(meetDetailsObj[meet].dynamic);
				var combined = Number(meetDetailsObj[meet].combined);
				var meetNameAndYear = meetDetailsObj[meet].name + ' ' + meetDetailsObj[meet].year;

				// set meet total
				meetDetailsObj[meet].meetTotal = balance + dynamic + combined;

				// push all scores and meet name to arrays for chart
				balanceArray.push(balance);
				dynamicArray.push(dynamic);
				combinedArray.push(combined);
				meetTotalScoreArray.push(meetDetailsObj[meet].meetTotal);
				meetNamesArray.push(meetNameAndYear);

			}
		}
		resultsObj.athleteChartData = [balanceArray, dynamicArray, combinedArray, meetTotalScoreArray];
		resultsObj.meetsArray = meetNamesArray;
		return resultsObj;
	}

	// constructor function for formatting athlete chart data
	var Meet = function(meetName, meetYear) {
		this.name = meetName;
		this.year = meetYear;
		this.balance = null;
		this.dynamic = null;
		this.combined = null;
		this.meetTotal = null;
	}

	return {
		test: consoleSomething,
		postScore: postScore,
		groupJustPosted: groupJustPosted,
		getScoresFromAthletes: getScoresFromAthletes,
		getScoresFromMeets: getScoresFromMeets,
		fetchAthletesAndMeets: fetchAthletesAndMeets,
		athleteList: athleteList,
		meetList: meetList,
		scoreJustAdded: scoreJustAdded,
		formatAthleteChartData: formatAthleteChartData
	};
}])



