angular.module('acroScore.factories', [])

.factory('getPostFactory', ['$http', function($http){
	// return console.log("inside the getPostFactory")
	var url = '/api/scores';
	var groupJustPosted = {};
	// var lastScoresRequested = {};
	var athleteList = {};
	var meetList = {};

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
			return response.data;
		})
	};

	// var getScores = function(data) {
	// 	return $http({
	// 		method: 'POST',
	// 		url: '/api/getscores',
	// 		data: data
	// 	})
	// 	.then(function(response) {
	// 		console.log("successfully fetched data");
	// 		console.log("response returned from getScores request", response);
	// 		lastScoresRequested.data = response.data;
	// 		return response.data;
	// 	})
	// }
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
	}

	return {
		test: consoleSomething,
		postScore: postScore,
		groupJustPosted: groupJustPosted,
		// getScores: getScores,
		fetchAthletesAndMeets: fetchAthletesAndMeets
	};
}])